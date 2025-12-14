import { NextRequest, NextResponse } from 'next/server';

// POST /api/webhooks/[agentId] - Handle webhook triggers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();

    // Mock webhook handling
    const result = {
      agentId,
      status: 'received',
      payload: body,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
