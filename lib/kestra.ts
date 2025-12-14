import { Agent } from "@prisma/client";
import axios, { AxiosInstance } from "axios";
import { KestraFlow, KestraExecution, WorkflowDefinition } from "./types";

// ==================== Kestra API Client ====================

export class KestraClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.KESTRA_API_URL || "http://localhost:8080";
    this.apiKey = process.env.KESTRA_API_KEY || "";

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      },
    });
  }

  /**
   * Create a new workflow in Kestra
   */
  async createWorkflow(
    agentConfig: Agent
  ): Promise<{ workflowId: string; flowYaml: string }> {
    const yaml = this.generateKestraYAML(agentConfig);
    const namespace = "agents";
    const flowId = `agent-${agentConfig.id}`;

    try {
      await this.client.put(`/api/v1/flows/${namespace}/${flowId}`, yaml, {
        headers: {
          "Content-Type": "text/plain",
        },
      });

      return {
        workflowId: `${namespace}.${flowId}`,
        flowYaml: yaml,
      };
    } catch (error: any) {
      console.error("Failed to create Kestra workflow:", error.response?.data || error.message);
      throw new Error(`Failed to create workflow: ${error.message}`);
    }
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(
    workflowId: string,
    agentConfig: Agent
  ): Promise<void> {
    const [namespace, flowId] = workflowId.split(".");
    const yaml = this.generateKestraYAML(agentConfig);

    try {
      await this.client.put(`/api/v1/flows/${namespace}/${flowId}`, yaml, {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    } catch (error: any) {
      console.error("Failed to update Kestra workflow:", error.response?.data || error.message);
      throw new Error(`Failed to update workflow: ${error.message}`);
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    inputs: Record<string, any> = {}
  ): Promise<{ executionId: string }> {
    const [namespace, flowId] = workflowId.split(".");

    try {
      const response = await this.client.post(
        `/api/v1/executions/${namespace}/${flowId}`,
        inputs
      );

      return {
        executionId: response.data.id,
      };
    } catch (error: any) {
      console.error("Failed to execute workflow:", error.response?.data || error.message);
      throw new Error(`Failed to execute workflow: ${error.message}`);
    }
  }

  /**
   * Get execution status and details
   */
  async getExecution(executionId: string): Promise<KestraExecution> {
    try {
      const response = await this.client.get(`/api/v1/executions/${executionId}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to get execution:", error.response?.data || error.message);
      throw new Error(`Failed to get execution: ${error.message}`);
    }
  }

  /**
   * Stream execution logs (generator function)
   */
  async *streamLogs(executionId: string): AsyncGenerator<string, void, unknown> {
    try {
      const response = await this.client.get(
        `/api/v1/executions/${executionId}/logs`,
        {
          responseType: "stream",
        }
      );

      const stream = response.data;
      
      for await (const chunk of stream) {
        yield chunk.toString();
      }
    } catch (error: any) {
      console.error("Failed to stream logs:", error.response?.data || error.message);
      throw new Error(`Failed to stream logs: ${error.message}`);
    }
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    const [namespace, flowId] = workflowId.split(".");

    try {
      await this.client.delete(`/api/v1/flows/${namespace}/${flowId}`);
    } catch (error: any) {
      console.error("Failed to delete workflow:", error.response?.data || error.message);
      throw new Error(`Failed to delete workflow: ${error.message}`);
    }
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    try {
      await this.client.post(`/api/v1/executions/${executionId}/kill`);
    } catch (error: any) {
      console.error("Failed to cancel execution:", error.response?.data || error.message);
      throw new Error(`Failed to cancel execution: ${error.message}`);
    }
  }

  /**
   * Generate Kestra YAML workflow from agent configuration
   */
  generateKestraYAML(agent: Agent): string {
    const triggers = Array.isArray(agent.triggers) ? agent.triggers : [];
    const tools = Array.isArray(agent.tools) ? agent.tools : [];

    // Build trigger configuration
    const triggerYaml = triggers
      .filter((t: any) => t.enabled)
      .map((trigger: any) => {
        switch (trigger.type) {
          case "WEBHOOK":
            return `  - id: webhook-trigger
    type: io.kestra.plugin.core.trigger.Webhook
    key: ${agent.id}`;
          
          case "SCHEDULE":
            return `  - id: schedule-trigger
    type: io.kestra.plugin.core.trigger.Schedule
    cron: "${trigger.config?.cron || '0 0 * * *'}"`;
          
          case "CHAT":
            return `  - id: chat-trigger
    type: io.kestra.plugin.core.trigger.Webhook
    key: ${agent.id}-chat`;
          
          default:
            return "";
        }
      })
      .filter((t: string) => t)
      .join("\n\n");

    // Build task configuration
    const tasksYaml = this.generateTasksYAML(agent, tools);

    return `id: agent-${agent.id}
namespace: agents
description: ${agent.description || agent.name}

inputs:
  - id: user_input
    type: STRING
    required: false
    defaults: ""
  - id: context
    type: JSON
    required: false

${triggerYaml ? `triggers:\n${triggerYaml}\n` : ""}
tasks:
${tasksYaml}
`;
  }

  /**
   * Generate tasks YAML based on agent configuration
   */
  private generateTasksYAML(agent: Agent, tools: any[]): string {
    const openrouterKey = process.env.OPENROUTER_API_KEY || "";
    const sambanovaKey = process.env.SAMBANOVA_API_KEY || "";
    const githubToken = process.env.GITHUB_TOKEN || "";

    return `  # Step 1: Parse user input with LLM
  - id: parse-input
    type: io.kestra.plugin.scripts.shell.Commands
    description: Analyze user input and create execution plan
    commands:
      - |
        cat > request.json << 'EOF'
        {
          "model": "${agent.model}",
          "messages": [
            {
              "role": "system",
              "content": ${JSON.stringify(agent.instructions)}
            },
            {
              "role": "user",
              "content": "{{ inputs.user_input }}"
            }
          ],
          "temperature": 0.3
        }
        EOF
      - |
        curl -X POST https://openrouter.ai/api/v1/chat/completions \\
          -H "Authorization: Bearer ${openrouterKey}" \\
          -H "Content-Type: application/json" \\
          -d @request.json \\
          > llm_response.json
      - cat llm_response.json
    outputs:
      llm_response: "{{ read('llm_response.json') }}"

  # Step 2: Execute tools based on LLM decision
  - id: execute-tools
    type: io.kestra.plugin.core.flow.Sequential
    description: Execute required tools in sequence
    tasks:
${this.generateToolTasksYAML(tools, { openrouterKey, sambanovaKey, githubToken })}

  # Step 3: Synthesize results
  - id: synthesize-results
    type: io.kestra.plugin.scripts.shell.Commands
    description: Combine tool results into final response
    commands:
      - |
        cat > synthesis_request.json << 'EOF'
        {
          "model": "${agent.model}",
          "messages": [
            {
              "role": "system",
              "content": "Synthesize the following tool execution results into a clear, actionable response."
            },
            {
              "role": "user",
              "content": "Results: {{ outputs['execute-tools'] }}"
            }
          ]
        }
        EOF
      - |
        curl -X POST https://openrouter.ai/api/v1/chat/completions \\
          -H "Authorization: Bearer ${openrouterKey}" \\
          -H "Content-Type: application/json" \\
          -d @synthesis_request.json \\
          > final_response.json
      - cat final_response.json
    outputs:
      final_response: "{{ read('final_response.json') }}"
`;
  }

  /**
   * Generate individual tool execution tasks
   */
  private generateToolTasksYAML(
    tools: any[],
    credentials: { openrouterKey: string; sambanovaKey: string; githubToken: string }
  ): string {
    if (!tools || tools.length === 0) {
      return `      - id: no-tools
        type: io.kestra.plugin.scripts.shell.Commands
        commands:
          - echo "No tools configured"`;
    }

    return tools
      .map((tool, index) => {
        return `      - id: tool-${index + 1}-${tool.toolId || "unknown"}
        type: io.kestra.plugin.scripts.shell.Commands
        description: Execute ${tool.toolId || "tool"}
        commands:
          - echo "Executing tool: ${tool.toolId}"
          - echo "Parameters: {{ toJson(inputs) }}"`;
      })
      .join("\n\n");
  }

  /**
   * Test Kestra connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get("/api/v1/flows");
      return true;
    } catch (error) {
      return false;
    }
  }
}

// ==================== Helper Functions ====================

/**
 * Create workflow for agent (legacy function for compatibility)
 */
export async function createKestraWorkflow(agent: Agent): Promise<string> {
  const client = new KestraClient();
  const result = await client.createWorkflow(agent);
  return result.workflowId;
}

/**
 * Start Kestra with Docker (for development)
 */
export async function startKestraDocker(): Promise<void> {
  const { exec } = require("child_process");
  const { promisify } = require("util");
  const execAsync = promisify(exec);

  try {
    console.log("Starting Kestra with Docker...");
    await execAsync(
      "docker run -d --name kestra --pull=always -p 8080:8080 kestra/kestra:latest server local"
    );
    console.log("Kestra started successfully on http://localhost:8080");
  } catch (error: any) {
    if (error.message.includes("already in use")) {
      console.log("Kestra is already running");
    } else {
      throw error;
    }
  }
}

// Export default instance
export const kestraClient = new KestraClient();
