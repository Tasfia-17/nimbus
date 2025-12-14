import { NextRequest, NextResponse } from 'next/server';

// POST /api/kestra/execute - Execute Kestra workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock Kestra workflow execution
    const execution = {
      id: `exec_${Date.now()}`,
      workflowId: body.workflowId,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      inputs: body.inputs || {},
    };

    return NextResponse.json({ execution });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to execute workflow' },
      { status: 500 }
    );
  }
}
