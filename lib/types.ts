// ==================== Core Agent Types ====================

export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: AgentStatus;
  kestraWorkflowId?: string;
  instructions: string;
  model: string;
  triggers: Trigger[];
  tools: ToolConfig[];
  createdAt: Date;
  updatedAt: Date;
}

export type AgentStatus = "ACTIVE" | "PAUSED" | "DELETED";

// ==================== Trigger Types ====================

export interface Trigger {
  id: string;
  type: TriggerType;
  config: TriggerConfig;
  enabled: boolean;
}

export type TriggerType = "CHAT" | "WEBHOOK" | "SCHEDULE" | "EMAIL" | "A2A";

export interface TriggerConfig {
  // For CHAT triggers
  channels?: string[];
  
  // For WEBHOOK triggers
  webhookUrl?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  
  // For SCHEDULE triggers
  cron?: string;
  timezone?: string;
  
  // For EMAIL triggers
  emailAddress?: string;
  subject?: string;
  
  // For A2A (Agent-to-Agent) triggers
  sourceAgentId?: string;
  condition?: string;
}

// ==================== Tool Types ====================

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  config: ToolExecutionConfig;
  createdAt: Date;
}

export type ToolType = "API" | "CLI" | "FUNCTION" | "DATABASE";

export interface ToolConfig {
  toolId: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface ToolExecutionConfig {
  // For API tools
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  authentication?: {
    type: "bearer" | "basic" | "apiKey" | "oauth2";
    credentials: Record<string, string>;
  };
  
  // For CLI tools
  command?: string;
  workingDirectory?: string;
  env?: Record<string, string>;
  timeout?: number;
  
  // For FUNCTION tools
  functionName?: string;
  module?: string;
  
  // For DATABASE tools
  connectionString?: string;
  query?: string;
  database?: string;
}

// ==================== Execution Types ====================

export interface Execution {
  id: string;
  agentId: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  cost?: number;
  logs: LogEntry[];
  result?: any;
  error?: string;
  steps: ExecutionStep[];
}

export type ExecutionStatus = "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  stepId?: string;
}

export type LogLevel = "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "DEBUG";

export interface ExecutionStep {
  id: string;
  name: string;
  type: "TOOL" | "LLM" | "DECISION" | "WORKFLOW";
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  input?: any;
  output?: any;
  error?: string;
  toolId?: string;
}

// ==================== LLM Types ====================

export interface LLMConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface LLMResponse {
  content: string;
  toolCalls?: ToolCall[];
  finishReason: "stop" | "length" | "tool_calls";
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

// ==================== Workflow Types ====================

export interface WorkflowDefinition {
  id: string;
  namespace: string;
  triggers: WorkflowTrigger[];
  tasks: WorkflowTask[];
  inputs?: Record<string, WorkflowInput>;
  outputs?: Record<string, any>;
}

export interface WorkflowTrigger {
  type: string;
  id: string;
  config?: Record<string, any>;
}

export interface WorkflowTask {
  id: string;
  type: string;
  description?: string;
  commands?: string[];
  script?: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  dependencies?: string[];
}

export interface WorkflowInput {
  type: "STRING" | "INTEGER" | "BOOLEAN" | "JSON" | "FILE";
  required?: boolean;
  default?: any;
  description?: string;
}

// ==================== Dashboard Types ====================

export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalExecutions: number;
  executionsToday: number;
  successRate: number;
  hoursSaved: number;
  totalCost: number;
}

export interface RecentActivity {
  id: string;
  agentId: string;
  agentName: string;
  status: ExecutionStatus;
  timestamp: Date;
  duration?: number;
  message: string;
}

// ==================== Agent Template Types ====================

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  instructions: string;
  model: string;
  triggers: Trigger[];
  tools: ToolConfig[];
  estimatedSetupTime: number; // in minutes
  requiredTools: string[];
  tags: string[];
}

export type TemplateCategory = 
  | "CODE_REVIEW" 
  | "DATA_ANALYSIS" 
  | "CUSTOMER_SUPPORT" 
  | "MONITORING" 
  | "AUTOMATION" 
  | "RESEARCH";

// ==================== API Response Types ====================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface APIError {
  message: string;
  code: string;
  details?: any;
  stack?: string;
}

// ==================== Form Validation Types ====================

export interface CreateAgentInput {
  name: string;
  description?: string;
  instructions: string;
  model: string;
  triggers: Trigger[];
  tools: ToolConfig[];
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {
  status?: AgentStatus;
}

// ==================== Real-time Types ====================

export interface SSEEvent {
  type: SSEEventType;
  data: any;
  timestamp: Date;
}

export type SSEEventType = 
  | "execution.started"
  | "execution.step.started"
  | "execution.step.completed"
  | "execution.log"
  | "execution.completed"
  | "execution.failed"
  | "agent.updated";

// ==================== Configuration Assistant Types ====================

export interface AssistantMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  suggestions?: AssistantSuggestion[];
}

export interface AssistantSuggestion {
  type: "tool" | "trigger" | "instruction" | "model";
  title: string;
  description: string;
  action: () => void;
  data?: any;
}

// ==================== Tool Execution Result ====================

export interface ToolExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  duration: number;
  cost?: number;
  metadata?: Record<string, any>;
}

// ==================== Kestra Types ====================

export interface KestraFlow {
  id: string;
  namespace: string;
  revision: number;
  tasks: KestraTask[];
  triggers?: KestraTrigger[];
}

export interface KestraTask {
  id: string;
  type: string;
  [key: string]: any;
}

export interface KestraTrigger {
  id: string;
  type: string;
  [key: string]: any;
}

export interface KestraExecution {
  id: string;
  namespace: string;
  flowId: string;
  state: {
    current: "CREATED" | "RUNNING" | "SUCCESS" | "FAILED" | "KILLED";
    histories: Array<{
      state: string;
      date: string;
    }>;
  };
  taskRunList: KestraTaskRun[];
}

export interface KestraTaskRun {
  id: string;
  taskId: string;
  state: {
    current: string;
  };
  outputs?: Record<string, any>;
  attempts?: Array<{
    state: {
      current: string;
    };
  }>;
}
