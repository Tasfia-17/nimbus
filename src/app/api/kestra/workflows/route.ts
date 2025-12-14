import { NextRequest, NextResponse } from 'next/server';

// POST /api/kestra/workflows - Create/update Kestra workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock Kestra workflow creation
    const workflow = {
      id: `workflow_${Date.now()}`,
      name: body.name || 'Unnamed Workflow',
      namespace: 'agents',
      status: 'created',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ workflow });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
