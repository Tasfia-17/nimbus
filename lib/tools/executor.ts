import { ToolExecutionConfig, ToolExecutionResult, ToolType } from '../types';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ==================== Tool Executor ====================

export class ToolExecutor {
  /**
   * Execute a tool based on its configuration
   */
  async execute(
    toolType: ToolType,
    config: ToolExecutionConfig,
    parameters: Record<string, any> = {}
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    try {
      let output: any;

      switch (toolType) {
        case 'API':
          output = await this.executeAPITool(config, parameters);
          break;
        case 'CLI':
          output = await this.executeCLITool(config, parameters);
          break;
        case 'FUNCTION':
          output = await this.executeFunctionTool(config, parameters);
          break;
        case 'DATABASE':
          output = await this.executeDatabaseTool(config, parameters);
          break;
        default:
          throw new Error(`Unsupported tool type: ${toolType}`);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        output,
        duration,
        cost: this.calculateCost(toolType, duration),
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error.message,
        duration,
      };
    }
  }

  /**
   * Execute an API tool
   */
  private async executeAPITool(
    config: ToolExecutionConfig,
    parameters: Record<string, any>
  ): Promise<any> {
    if (!config.url) {
      throw new Error('API tool requires a URL');
    }

    const method = config.method || 'GET';
    const headers = config.headers || {};

    // Add authentication if provided
    if (config.authentication) {
      switch (config.authentication.type) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${config.authentication.credentials.token}`;
          break;
        case 'apiKey':
          const apiKeyHeader = config.authentication.credentials.header || 'X-API-Key';
          headers[apiKeyHeader] = config.authentication.credentials.key;
          break;
        case 'basic':
          const { username, password } = config.authentication.credentials;
          const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');
          headers['Authorization'] = `Basic ${encodedCredentials}`;
          break;
      }
    }

    // Replace parameters in URL
    let url = config.url;
    Object.keys(parameters).forEach((key) => {
      url = url.replace(`{${key}}`, encodeURIComponent(parameters[key]));
      url = url.replace(`{{${key}}}`, encodeURIComponent(parameters[key]));
    });

    const requestConfig: any = {
      method,
      url,
      headers,
    };

    if (method === 'GET') {
      requestConfig.params = parameters;
    } else {
      requestConfig.data = parameters;
    }

    const response = await axios(requestConfig);
    return response.data;
  }

  /**
   * Execute a CLI tool
   */
  private async executeCLITool(
    config: ToolExecutionConfig,
    parameters: Record<string, any>
  ): Promise<any> {
    if (!config.command) {
      throw new Error('CLI tool requires a command');
    }

    let command = config.command;

    // Replace parameters in command
    Object.keys(parameters).forEach((key) => {
      command = command.replace(`{${key}}`, parameters[key]);
      command = command.replace(`{{${key}}}`, parameters[key]);
    });

    const options: any = {
      cwd: config.workingDirectory || process.cwd(),
      env: { ...process.env, ...config.env },
    };

    if (config.timeout) {
      options.timeout = config.timeout;
    }

    const { stdout, stderr } = await execAsync(command, options);

    if (stderr && !stdout) {
      throw new Error(String(stderr));
    }

    return {
      stdout: String(stdout).trim(),
      stderr: String(stderr).trim(),
    };
  }

  /**
   * Execute a function tool
   */
  private async executeFunctionTool(
    config: ToolExecutionConfig,
    parameters: Record<string, any>
  ): Promise<any> {
    if (!config.functionName) {
      throw new Error('Function tool requires a function name');
    }

    // This would load and execute a predefined function
    // For now, throw an error as we need to implement the function registry
    throw new Error('Function tools not yet implemented. Please define functions in predefined tools.');
  }

  /**
   * Execute a database tool
   */
  private async executeDatabaseTool(
    config: ToolExecutionConfig,
    parameters: Record<string, any>
  ): Promise<any> {
    if (!config.connectionString || !config.query) {
      throw new Error('Database tool requires connectionString and query');
    }

    // This would execute a database query
    // For now, throw an error as we need to implement database connection pooling
    throw new Error('Database tools not yet implemented. Use Prisma client directly for now.');
  }

  /**
   * Calculate estimated cost for tool execution
   */
  private calculateCost(toolType: ToolType, duration: number): number {
    // Simple cost estimation (can be refined)
    const costPerSecond: Record<ToolType, number> = {
      API: 0.0001,
      CLI: 0.00001,
      FUNCTION: 0.000001,
      DATABASE: 0.0001,
    };

    return (duration / 1000) * costPerSecond[toolType];
  }
}

// ==================== Pre-defined Tool Functions ====================

/**
 * GitHub API Tools
 */
export const githubTools = {
  async getRepository(owner: string, repo: string): Promise<any> {
    const token = process.env.GITHUB_TOKEN;
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.data;
  },

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string,
    labels?: string[]
  ): Promise<any> {
    const token = process.env.GITHUB_TOKEN;
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        title,
        body,
        labels: labels || [],
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    return response.data;
  },

  async postComment(owner: string, repo: string, issueNumber: number, body: string): Promise<any> {
    const token = process.env.GITHUB_TOKEN;
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      { body },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    return response.data;
  },

  async listPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<any> {
    const token = process.env.GITHUB_TOKEN;
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      params: { state },
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.data;
  },
};

/**
 * Web Scraping Tools
 */
export const webTools = {
  async fetchWebpage(url: string): Promise<string> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    return response.data;
  },

  async scrapeContent(url: string, selector?: string): Promise<any> {
    const html = await this.fetchWebpage(url);
    // For full implementation, you would use cheerio or similar
    // For now, return raw HTML
    return {
      url,
      html: html.substring(0, 5000), // Return first 5000 chars
      contentLength: html.length,
    };
  },

  async checkWebsiteStatus(url: string): Promise<any> {
    try {
      const startTime = Date.now();
      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: () => true,
      });
      const responseTime = Date.now() - startTime;

      return {
        url,
        statusCode: response.status,
        statusText: response.statusText,
        responseTime,
        isOnline: response.status >= 200 && response.status < 400,
      };
    } catch (error: any) {
      return {
        url,
        isOnline: false,
        error: error.message,
      };
    }
  },
};

/**
 * Data Tools
 */
export const dataTools = {
  async transformJSON(data: any, transformations: Record<string, any>): Promise<any> {
    // Simple JSON transformation
    const result: any = {};

    for (const [key, value] of Object.entries(transformations)) {
      if (typeof value === 'string' && value.startsWith('$')) {
        // Extract value from data using path
        const path = value.substring(1).split('.');
        let current = data;
        for (const segment of path) {
          current = current?.[segment];
        }
        result[key] = current;
      } else {
        result[key] = value;
      }
    }

    return result;
  },

  async filterArray(array: any[], condition: (item: any) => boolean): Promise<any[]> {
    return array.filter(condition);
  },

  async aggregateData(data: any[], groupBy: string, aggregation: string): Promise<any> {
    const groups: Record<string, any[]> = {};

    // Group data
    data.forEach((item) => {
      const key = item[groupBy];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    // Apply aggregation
    const result: Record<string, any> = {};
    for (const [key, items] of Object.entries(groups)) {
      switch (aggregation) {
        case 'count':
          result[key] = items.length;
          break;
        case 'sum':
          result[key] = items.reduce((acc, item) => acc + (item.value || 0), 0);
          break;
        case 'avg':
          const sum = items.reduce((acc, item) => acc + (item.value || 0), 0);
          result[key] = sum / items.length;
          break;
        default:
          result[key] = items;
      }
    }

    return result;
  },
};

// Export default executor instance
export const toolExecutor = new ToolExecutor();
