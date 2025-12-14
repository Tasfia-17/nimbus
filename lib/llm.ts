import { ChatMessage, LLMResponse, LLMConfig } from './types';
import axios from 'axios';

// ==================== LLM Provider Configuration ====================

interface LLMProvider {
  name: string;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
}

const providers: Record<string, LLMProvider> = {
  openrouter: {
    name: 'OpenRouter',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultModel: 'meta-llama/llama-3.1-405b-instruct',
  },
  sambanova: {
    name: 'SambaNova',
    baseUrl: process.env.SAMBANOVA_BASE_URL || 'https://cloud.sambanova.ai/apis',
    apiKey: process.env.SAMBANOVA_API_KEY || '',
    defaultModel: 'Meta-Llama-3.1-405B-Instruct',
  },
};

// ==================== Main LLM Client Class ====================

export class LLMClient {
  private provider: LLMProvider;

  constructor(providerName: 'openrouter' | 'sambanova' = 'openrouter') {
    const provider = providers[providerName];
    if (!provider || !provider.apiKey) {
      throw new Error(`LLM Provider ${providerName} is not configured. Please set the API key in .env.local`);
    }
    this.provider = provider;
  }

  /**
   * Send a chat completion request to the LLM
   */
  async chat(
    messages: ChatMessage[],
    config: Partial<LLMConfig> = {}
  ): Promise<LLMResponse> {
    const model = config.model || this.provider.defaultModel;
    
    try {
      const response = await axios.post(
        `${this.provider.baseUrl}/chat/completions`,
        {
          model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            ...(msg.name && { name: msg.name }),
          })),
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens ?? 4096,
          top_p: config.topP ?? 1,
          frequency_penalty: config.frequencyPenalty ?? 0,
          presence_penalty: config.presencePenalty ?? 0,
          ...(config.stop && { stop: config.stop }),
        },
        {
          headers: {
            'Authorization': `Bearer ${this.provider.apiKey}`,
            'Content-Type': 'application/json',
            ...(this.provider.name === 'OpenRouter' && {
              'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
              'X-Title': 'Agent Platform',
            }),
          },
        }
      );

      const choice = response.data.choices[0];
      
      return {
        content: choice.message.content,
        toolCalls: choice.message.tool_calls,
        finishReason: choice.finish_reason,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
      };
    } catch (error: any) {
      console.error('LLM API Error:', error.response?.data || error.message);
      throw new Error(`Failed to get LLM response: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Parse user input and determine what the agent should do
   */
  async parseUserInput(
    userInput: string,
    agentInstructions: string
  ): Promise<{
    intent: string;
    reasoning: string;
    suggestedActions: string[];
  }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an AI agent analyzer. Your job is to understand what the user wants and suggest appropriate actions.
        
Agent Instructions: ${agentInstructions}

Parse the user's input and respond with JSON:
{
  "intent": "brief description of what user wants",
  "reasoning": "your analysis of the request",
  "suggestedActions": ["action1", "action2", ...]
}`,
      },
      {
        role: 'user',
        content: userInput,
      },
    ];

    const response = await this.chat(messages, { temperature: 0.3, maxTokens: 1000 });
    
    try {
      return JSON.parse(response.content);
    } catch {
      return {
        intent: userInput,
        reasoning: response.content,
        suggestedActions: [],
      };
    }
  }

  /**
   * Create an execution plan based on available tools
   */
  async createExecutionPlan(
    intent: string,
    availableTools: Array<{ id: string; name: string; description: string }>,
    context?: string
  ): Promise<{
    steps: Array<{
      toolId: string;
      toolName: string;
      reason: string;
      parameters: Record<string, any>;
    }>;
    estimatedDuration: number;
  }> {
    const toolsDescription = availableTools
      .map(tool => `- ${tool.name} (${tool.id}): ${tool.description}`)
      .join('\n');

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an AI agent planner. Create a step-by-step execution plan using the available tools.

Available Tools:
${toolsDescription}

${context ? `Context: ${context}` : ''}

Respond with JSON:
{
  "steps": [
    {
      "toolId": "tool_id",
      "toolName": "Tool Name",
      "reason": "why this tool is needed",
      "parameters": { "param1": "value1" }
    }
  ],
  "estimatedDuration": 30
}`,
      },
      {
        role: 'user',
        content: `Create an execution plan for: ${intent}`,
      },
    ];

    const response = await this.chat(messages, { temperature: 0.2, maxTokens: 2000 });
    
    try {
      return JSON.parse(response.content);
    } catch {
      return {
        steps: [],
        estimatedDuration: 0,
      };
    }
  }

  /**
   * Decide the next step based on current state
   */
  async decideNextStep(
    currentState: {
      intent: string;
      completedSteps: Array<{ toolName: string; output: any }>;
      remainingSteps: Array<{ toolName: string; parameters: any }>;
    },
    availableTools: Array<{ id: string; name: string; description: string }>
  ): Promise<{
    shouldContinue: boolean;
    nextAction?: {
      toolId: string;
      parameters: Record<string, any>;
    };
    reasoning: string;
  }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an AI agent decision maker. Based on the current execution state, decide if we should continue and what to do next.

Respond with JSON:
{
  "shouldContinue": true/false,
  "nextAction": {
    "toolId": "tool_id",
    "parameters": { "param": "value" }
  },
  "reasoning": "explanation of decision"
}`,
      },
      {
        role: 'user',
        content: JSON.stringify(currentState, null, 2),
      },
    ];

    const response = await this.chat(messages, { temperature: 0.3, maxTokens: 1000 });
    
    try {
      return JSON.parse(response.content);
    } catch {
      return {
        shouldContinue: false,
        reasoning: 'Failed to parse decision',
      };
    }
  }

  /**
   * Synthesize results from multiple tool executions
   */
  async synthesizeResults(
    originalIntent: string,
    toolResults: Array<{
      toolName: string;
      output: any;
      success: boolean;
    }>
  ): Promise<{
    summary: string;
    detailedAnalysis: string;
    recommendations?: string[];
  }> {
    const resultsDescription = toolResults
      .map(
        (result, idx) =>
          `${idx + 1}. ${result.toolName}: ${result.success ? 'SUCCESS' : 'FAILED'}\n   Output: ${JSON.stringify(result.output).slice(0, 500)}`
      )
      .join('\n\n');

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an AI agent synthesizer. Analyze the results from multiple tool executions and create a comprehensive response.

Original Intent: ${originalIntent}

Tool Results:
${resultsDescription}

Respond with JSON:
{
  "summary": "brief summary for the user",
  "detailedAnalysis": "detailed analysis of what was accomplished",
  "recommendations": ["recommendation1", "recommendation2"]
}`,
      },
      {
        role: 'user',
        content: 'Please synthesize these results into a clear response.',
      },
    ];

    const response = await this.chat(messages, { temperature: 0.4, maxTokens: 2000 });
    
    try {
      return JSON.parse(response.content);
    } catch {
      return {
        summary: response.content,
        detailedAnalysis: response.content,
      };
    }
  }

  /**
   * Generate code using LLM
   */
  async generateCode(
    prompt: string,
    language: string = 'typescript',
    context?: string
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert ${language} programmer. Generate clean, well-documented code based on the user's request.
        
${context ? `Context: ${context}` : ''}

Respond with ONLY the code, no explanations or markdown formatting.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await this.chat(messages, { temperature: 0.2, maxTokens: 4096 });
    return response.content;
  }
}

// ==================== Helper Functions ====================

/**
 * Calculate the cost of an LLM request based on usage
 */
export function calculateLLMCost(
  usage: { promptTokens: number; completionTokens: number },
  model: string
): number {
  // Cost per million tokens (approximate)
  const costs: Record<string, { input: number; output: number }> = {
    'meta-llama/llama-3.1-405b-instruct': { input: 0.6, output: 0.6 },
    'Meta-Llama-3.1-405B-Instruct': { input: 0.6, output: 0.6 },
    'anthropic/claude-3-opus': { input: 15, output: 75 },
    'openai/gpt-4': { input: 30, output: 60 },
  };

  const modelCosts = costs[model] || { input: 0.6, output: 0.6 };

  const inputCost = (usage.promptTokens / 1_000_000) * modelCosts.input;
  const outputCost = (usage.completionTokens / 1_000_000) * modelCosts.output;

  return inputCost + outputCost;
}

/**
 * Create a default LLM client instance
 */
export function createLLMClient(provider: 'openrouter' | 'sambanova' = 'openrouter'): LLMClient {
  return new LLMClient(provider);
}

// Export default instance
export const llmClient = new LLMClient('openrouter');
