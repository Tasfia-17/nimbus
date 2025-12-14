import { NextRequest, NextResponse } from 'next/server';

// GET /api/tools - List available tools
export async function GET(request: NextRequest) {
  try {
    const tools = [
      {
        id: '1',
        name: 'Web Scraper',
        description: 'Scrapes content from websites',
        type: 'API',
      },
      {
        id: '2',
        name: 'GitHub API',
        description: 'Interacts with GitHub repositories',
        type: 'API',
      },
      {
        id: '3',
        name: 'Send Email',
        description: 'Sends emails via SMTP',
        type: 'FUNCTION',
      },
    ];

    return NextResponse.json({ tools });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}
