type LoadingListener = (isLoading: boolean) => void;

class LoadingManager {
  private listeners: Set<LoadingListener> = new Set();
  private count: number = 0;
  
  // Pages where loading should be disabled
  private excludedPaths: string[] = ['/admin/login', '/admin/forgot-password'];

  // Check if current path should show loading
  private shouldShowLoading(): boolean {
    // Only run in browser environment
    if (typeof window === 'undefined') return true;
    
    const currentPath = window.location.pathname;
    return !this.excludedPaths.includes(currentPath);
  }

  subscribe(listener: LoadingListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const isLoading = this.count > 0 && this.shouldShowLoading();
    this.listeners.forEach(listener => listener(isLoading));
  }

  start(): void {
    if (this.shouldShowLoading()) {
      this.count++;
      this.notify();
    }
  }

  stop(): void {
    if (this.shouldShowLoading()) {
      this.count = Math.max(0, this.count - 1);
      this.notify();
    }
  }

  getCount(): number {
    return this.count;
  }
}

export const loadingManager = new LoadingManager();