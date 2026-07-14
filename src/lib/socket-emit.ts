import type { Server as SocketServer } from "socket.io";

export function emitScheduleEvent(eventType: string) {
  const io = (globalThis as unknown as { __io?: SocketServer }).__io;
  if (io) {
    io.emit("schedule_change", { type: eventType, timestamp: Date.now() });
  }
}
