import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents - List all agents
export async function GET(request: NextRequest) {
  try {
    // Mock agents list
    const agents = [
      {
        id: '1',
        name: 'Competition Scanner',
        description: 'Analyzes competitors and generates reports',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Code Reviewer',
        description: 'Reviews pull requests automatically',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ agents });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock agent creation
    const agent = {
      id: `agent_${Date.now()}`,
      ...body,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
