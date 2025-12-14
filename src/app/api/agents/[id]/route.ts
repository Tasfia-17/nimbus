import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents/[id] - Get agent by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    // Mock agent data
    const agent = {
      id: agentId,
      name: 'Sample Agent',
      description: 'A sample AI agent',
      status: 'ACTIVE',
      instructions: 'You are a helpful AI assistant.',
      model: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const executions = [
      {
        id: '1',
        agentId,
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date().toISOString(),
        duration: 3600,
      },
    ];

    return NextResponse.json({ agent, executions });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// PUT /api/agents/[id] - Update agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();

    // Mock update response
    const agent = {
      id: agentId,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ agent });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    return NextResponse.json({ success: true, id: agentId });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
