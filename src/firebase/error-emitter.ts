import { FirestorePermissionError } from './errors';

type Events = {
  'permission-error': (error: FirestorePermissionError) => void;
};

class ErrorEmitter {
  private listeners: { [K in keyof Events]?: Events[K][] } = {};

  on<K extends keyof Events>(event: K, listener: Events[K]): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);

    return () => {
      if(this.listeners[event]) {
        this.listeners[event] = this.listeners[event]!.filter(l => l !== listener);
      }
    };
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
  }
}

export const errorEmitter = new ErrorEmitter();
