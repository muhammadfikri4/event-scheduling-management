import { scheduleEvents } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial ping
      controller.enqueue(encoder.encode("data: {\"type\":\"connected\"}\n\n"));

      // Keep-alive every 30s
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 30000);

      // Listen for schedule changes
      const unsubscribe = scheduleEvents.subscribe((data) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // Client disconnected
        }
      });

      // Cleanup on close
      const cleanup = () => {
        clearInterval(keepAlive);
        unsubscribe();
      };

      // Handle abort
      if (typeof controller.close === "function") {
        const originalClose = controller.close.bind(controller);
        controller.close = () => {
          cleanup();
          originalClose();
        };
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
