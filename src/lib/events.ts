// Simple in-memory event emitter for SSE
type Listener = (data: string) => void;

class ScheduleEvents {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(eventType: string) {
    const data = JSON.stringify({ type: eventType, timestamp: Date.now() });
    this.listeners.forEach((listener) => listener(data));
  }
}

// Singleton — works because Next.js API routes share the same process
const globalForEvents = globalThis as unknown as { scheduleEvents?: ScheduleEvents };
export const scheduleEvents = globalForEvents.scheduleEvents ?? new ScheduleEvents();
if (process.env.NODE_ENV !== "production") globalForEvents.scheduleEvents = scheduleEvents;
