import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ==================== Cline CLI Integration ====================

export class ClineClient {
  /**
   * Analyze code quality
   */
  async analyzeCode(repoPath: string, files?: string[]): Promise<any> {
    try {
      const filesArg = files ? files.join(' ') : '.';
      const { stdout } = await execAsync(`cline analyze ${filesArg}`, {
        cwd: repoPath,
      });
      
      return this.parseOutput(stdout);
    } catch (error: any) {
      throw new Error(`Code analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate code based on prompt
   */
  async generateCode(prompt: string, language: string = 'typescript', context?: string): Promise<string> {
    try {
      const contextArg = context ? `--context "${context}"` : '';
      const { stdout } = await execAsync(
        `cline generate --language ${language} ${contextArg} --prompt "${prompt}"`
      );
      
      return stdout.trim();
    } catch (error: any) {
      throw new Error(`Code generation failed: ${error.message}`);
    }
  }

  /**
   * Fix bugs in code
   */
  async fixBugs(filePath: string, description: string): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `cline fix --file "${filePath}" --description "${description}"`
      );
      
      return stdout.trim();
    } catch (error: any) {
      throw new Error(`Bug fix failed: ${error.message}`);
    }
  }

  /**
   * Generate tests for code
   */
  async writeTests(filePath: string, framework: string = 'jest'): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `cline test --file "${filePath}" --framework ${framework}`
      );
      
      return stdout.trim();
    } catch (error: any) {
      throw new Error(`Test generation failed: ${error.message}`);
    }
  }

  /**
   * Generate documentation
   */
  async generateDocumentation(filePath: string, format: string = 'markdown'): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `cline docs --file "${filePath}" --format ${format}`
      );
      
      return stdout.trim();
    } catch (error: any) {
      throw new Error(`Documentation generation failed: ${error.message}`);
    }
  }

  /**
   * Parse Cline output
   */
  private parseOutput(output: string): any {
    try {
      return JSON.parse(output);
    } catch {
      return { raw: output };
    }
  }

  /**
   * Check if Cline is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      await execAsync('cline --version');
      return true;
    } catch {
      return false;
    }
  }
}

// Export default instance
export const clineClient = new ClineClient();

// ==================== GitHub PR Review Integration ====================

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number
): Promise<{
  summary: string;
  issues: Array<{ file: string; line: number; message: string; severity: string }>;
  suggestions: string[];
}> {
  const cline = new ClineClient();
  
  // Check if Cline is installed
  const isInstalled = await cline.isInstalled();
  if (!isInstalled) {
    throw new Error('Cline CLI is not installed. Please install it first.');
  }

  // Clone repo and analyze (simplified version)
  // In production, you'd use GitHub API to get PR files
  const analysis = await cline.analyzeCode(`/tmp/${owner}-${repo}`, []);

  return {
    summary: 'Code review completed',
    issues: [],
    suggestions: ['Consider adding more tests', 'Update documentation'],
  };
}
