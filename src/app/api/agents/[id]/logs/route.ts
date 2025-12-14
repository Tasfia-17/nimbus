import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;

  // Create a readable stream for Server-Sent Events
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const message = `data: ${JSON.stringify({
        type: 'connected',
        agentId,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(message));

      // Send sample log messages
      const logs = [
        { type: 'info', message: 'Agent execution started', timestamp: new Date().toISOString() },
        { type: 'info', message: 'Loading agent configuration...', timestamp: new Date().toISOString() },
        { type: 'success', message: 'Agent loaded successfully', timestamp: new Date().toISOString() },
        { type: 'info', message: 'Initializing tools...', timestamp: new Date().toISOString() },
      ];

      let index = 0;
      const interval = setInterval(() => {
        if (index < logs.length) {
          const logMessage = `data: ${JSON.stringify(logs[index])}\n\n`;
          controller.enqueue(encoder.encode(logMessage));
          index++;
        } else {
          // Send completion message
          const completeMessage = `data: ${JSON.stringify({
            type: 'complete',
            message: 'Log stream ended',
            timestamp: new Date().toISOString(),
          })}\n\n`;
          controller.enqueue(encoder.encode(completeMessage));
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      // Cleanup on stream close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
