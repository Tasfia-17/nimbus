// Pre-built Agent Templates

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  instructions: string;
  model: string;
  triggers: any[];
  tools: any[];
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const agentTemplates: AgentTemplate[] = [
  {
    id: 'competition-scanner',
    name: 'Competition Scanner',
    description: 'Automatically analyze competitor websites, compare features, and generate detailed competitive analysis reports.',
    category: 'Business Intelligence',
    icon: '🔍',
    instructions: `You are a competitive analysis agent. Your job is to select a competitor, research them based on the provided URLs, write a competitive analysis, and compare it to previously stored analysis (if present). If the new analysis is **materially different** from the previously saved one, update the database with the new analysis and notify the user.

# Instructions
1. Select a Competitor
   - Get a list of competitors from the database, this includes a list of URLs to their main website, pricing page, blog, and release notes.
   - Ensure that only one competitor is actively selected for this analysis cycle.

2. Research the Competitor
   - Use the Get Webpage Content tool to research the provided URLs for the competitor
   - Synthesize the key content from these URLs before passing to the "Write Competitive Report" Tool. Ensure that you include all relevant details to write a competitive report with these categories: Competitor Overview, Product Features & Differentiation, Pricing Strategy, Market Positioning & Branding, Customer Reviews & Sentiment, Technology Stack & Integrations, Competitive Advantages & Weaknesses, Recent News & Developments, SWOT Analysis.

3. Write the Competitive Analysis
   - Pass the synthesized key content from your research to the "Write Competitive Report" tool.
   - This will output a competitive analysis report

4. Compare Against Previous Analysis
   - Fetch the previously saved competitive analysis if you haven't already. This is the report from the last time you generated a competitive analysis.
   - Use the **Compare Reports** tool to compare the newly written analysis to the previously saved version.
   - Ensure that you pass the full context of the previously saved report and the newly generated report correctly.
   - Your goal at this step is to determine if the newly written analysis is **materially different** from the previously generated one.
     - **Materially different** means it has significant updates or insights that would impact decision-making.

5. Save if Materially Different
   - If there is no currently saved report, then you can save the new one to the database — this qualifies as materially different.
   - If the **Compare Reports** tool determines that the newly written analysis is **materially different**, save the new analysis to the database and notify the user.`,
    model: 'meta-llama/llama-3.1-405b-instruct',
    triggers: [
      {
        id: 'schedule-1',
        type: 'SCHEDULE',
        enabled: true,
        config: { cron: '0 9 * * MON' } // Every Monday at 9 AM
      }
    ],
    tools: [
      {
        toolId: 'get-webpage-content',
        name: 'Get Webpage Content',
        enabled: true,
        description: 'Fetch and extract content from web pages'
      },
      {
        toolId: 'get-competitors',
        name: 'Get Competitors',
        enabled: true,
        description: 'Retrieve list of competitors from database'
      },
      {
        toolId: 'write-competitive-report',
        name: 'Write Competitive Report',
        enabled: true,
        description: 'Generate comprehensive competitive analysis'
      },
      {
        toolId: 'compare-reports',
        name: 'Compare Reports',
        enabled: true,
        description: 'Compare two analysis reports for material differences'
      }
    ],
    estimatedTime: '5-8 minutes',
    difficulty: 'Advanced'
  },
  
  {
    id: 'meeting-prep',
    name: 'Meeting Prep Assistant',
    description: 'Research meeting attendees on LinkedIn, gather context, and create comprehensive preparation materials automatically.',
    category: 'Productivity',
    icon: '📅',
    instructions: `You are a meeting preparation assistant. When a meeting is scheduled, you:
1. Extract attendee information from the calendar event
2. Research each attendee on LinkedIn to gather professional background
3. Find recent news and updates about their companies
4. Create a comprehensive briefing document with:
   - Attendee profiles and backgrounds
   - Company information and recent news
   - Suggested talking points
   - Key facts and figures
5. Generate talking points and conversation starters
6. Save the briefing to a shared document or send via email`,
    model: 'meta-llama/llama-3.1-70b-instruct',
    triggers: [
      {
        id: 'calendar-1',
        type: 'CALENDAR',
        enabled: true,
        config: { leadTime: '24h' } // 24 hours before meeting
      }
    ],
    tools: [
      {
        toolId: 'linkedin-search',
        name: 'LinkedIn Search',
        enabled: true,
        description: 'Search for professionals on LinkedIn'
      },
      {
        toolId: 'web-search',
        name: 'Web Search',
        enabled: true,
        description: 'Search the web for information'
      },
      {
        toolId: 'create-document',
        name: 'Create Document',
        enabled: true,
        description: 'Create a Google Doc or similar'
      },
      {
        toolId: 'send-email',
        name: 'Send Email',
        enabled: true,
        description: 'Send email notifications'
      }
    ],
    estimatedTime: '3-5 minutes',
    difficulty: 'Intermediate'
  },

  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    description: 'Handle customer queries automatically by checking order status, processing refunds, and escalating complex issues.',
    category: 'Customer Service',
    icon: '💬',
    instructions: `You are an intelligent customer support agent. Your responsibilities:
1. Understand customer queries and classify them by type (order status, refund, technical issue, etc.)
2. For order inquiries:
   - Query the database for order information
   - Provide tracking details and status updates
3. For refund requests:
   - Verify order eligibility
   - Process refunds within policy guidelines
   - Send confirmation emails
4. For technical issues:
   - Attempt to troubleshoot common problems
   - Provide step-by-step solutions
5. For complex issues:
   - Create a support ticket
   - Escalate to human agents
   - Notify customer of escalation
Always be polite, professional, and helpful. Explain your actions clearly.`,
    model: 'meta-llama/llama-3.1-70b-instruct',
    triggers: [
      {
        id: 'email-1',
        type: 'EMAIL',
        enabled: true,
        config: { inbox: 'support@company.com' }
      },
      {
        id: 'chat-1',
        type: 'CHAT',
        enabled: true
      }
    ],
    tools: [
      {
        toolId: 'database-query',
        name: 'Database Query',
        enabled: true,
        description: 'Query orders database'
      },
      {
        toolId: 'process-refund',
        name: 'Process Refund',
        enabled: true,
        description: 'Issue refunds'
      },
      {
        toolId: 'send-email',
        name: 'Send Email',
        enabled: true,
        description: 'Send emails to customers'
      },
      {
        toolId: 'create-ticket',
        name: 'Create Ticket',
        enabled: true,
        description: 'Create support tickets'
      }
    ],
    estimatedTime: '1-2 minutes',
    difficulty: 'Intermediate'
  },

  {
    id: 'data-analyst',
    name: 'Data Analyst Agent',
    description: 'Analyze data from multiple sources, generate insights, create visualizations, and produce automated reports.',
    category: 'Analytics',
    icon: '📊',
    instructions: `You are a data analyst agent. Your workflow:
1. Connect to specified data sources (databases, APIs, files)
2. Extract and validate data quality
3. Perform analysis based on the request:
   - Descriptive statistics
   - Trend analysis
   - Correlation analysis
   - Anomaly detection
4. Generate visualizations:
   - Charts and graphs
   - Dashboards
   - Interactive reports
5. Identify key insights and patterns
6. Create narrative explanations of findings
7. Produce final report with:
   - Executive summary
   - Detailed analysis
   - Visualizations
   - Recommendations
8. Schedule regular automated reports if needed`,
    model: 'meta-llama/llama-3.1-405b-instruct',
    triggers: [
      {
        id: 'schedule-1',
        type: 'SCHEDULE',
        enabled: true,
        config: { cron: '0 8 * * MON' } // Every Monday at 8 AM
      }
    ],
    tools: [
      {
        toolId: 'sql-query',
        name: 'SQL Query',
        enabled: true,
        description: 'Query databases with SQL'
      },
      {
        toolId: 'kestra-workflow',
        name: 'Kestra Data Pipeline',
        enabled: true,
        description: 'Execute data processing workflows'
      },
      {
        toolId: 'generate-chart',
        name: 'Generate Chart',
        enabled: true,
        description: 'Create data visualizations'
      },
      {
        toolId: 'create-report',
        name: 'Create Report',
        enabled: true,
        description: 'Generate PDF/HTML reports'
      }
    ],
    estimatedTime: '10-15 minutes',
    difficulty: 'Advanced'
  },

  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Automatically review pull requests, suggest improvements, run tests, and provide detailed feedback on code quality.',
    category: 'Development',
    icon: '🔎',
    instructions: `You are an automated code reviewer powered by Cline. When a pull request is created:
1. Fetch the PR details from GitHub
2. Analyze the code changes:
   - Check for bugs and potential issues
   - Verify coding standards and best practices
   - Look for security vulnerabilities
   - Assess test coverage
3. Run automated tests if available
4. Generate detailed feedback including:
   - Line-by-line comments on issues
   - Suggestions for improvements
   - Security and performance considerations
   - Documentation suggestions
5. Post review comments to the PR
6. Assign overall rating (Approve, Request Changes, Comment)
7. Suggest additional tests if needed
Be constructive, specific, and helpful in your feedback.`,
    model: 'meta-llama/llama-3.1-70b-instruct',
    triggers: [
      {
        id: 'webhook-1',
        type: 'WEBHOOK',
        enabled: true,
        config: { event: 'pull_request.opened' }
      }
    ],
    tools: [
      {
        toolId: 'github-get-pr',
        name: 'Get Pull Request',
        enabled: true,
        description: 'Fetch PR details from GitHub'
      },
      {
        toolId: 'cline-analyze',
        name: 'Cline Code Analysis',
        enabled: true,
        description: 'Analyze code with Cline'
      },
      {
        toolId: 'run-tests',
        name: 'Run Tests',
        enabled: true,
        description: 'Execute test suite'
      },
      {
        toolId: 'github-post-comment',
        name: 'Post Comment',
        enabled: true,
        description: 'Post review comments'
      }
    ],
    estimatedTime: '2-4 minutes',
    difficulty: 'Advanced'
  }
];

export function getTemplateById(id: string): AgentTemplate | undefined {
  return agentTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): AgentTemplate[] {
  return agentTemplates.filter(t => t.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(agentTemplates.map(t => t.category)));
}
