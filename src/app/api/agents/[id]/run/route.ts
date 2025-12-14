import { NextRequest, NextResponse } from 'next/server';

// POST /api/agents/[id]/run - Execute agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();

    // Mock execution response
    const execution = {
      id: `exec_${Date.now()}`,
      agentId,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      input: body.input || {},
    };

    return NextResponse.json({ execution });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to execute agent' },
      { status: 500 }
    );
  }
}
