type LoadingListener = (isLoading: boolean) => void;

class LoadingManager {
  private listeners: Set<LoadingListener> = new Set();
  private count: number = 0;

  subscribe(listener: LoadingListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const isLoading = this.count > 0;
    this.listeners.forEach(listener => listener(isLoading));
  }

  start(): void {
    this.count++;
    this.notify();
  }

  stop(): void {
    this.count = Math.max(0, this.count - 1);
    this.notify();
  }

  getCount(): number {
    return this.count;
  }
}

export const loadingManager = new LoadingManager();