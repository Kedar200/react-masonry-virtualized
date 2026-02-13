// Performance measurement utilities for benchmarking

export interface Metrics {
  fps: number;
  avgFps: number;
  memoryMB: number;
  renderCount: number;
  lastRenderTime: number;
}

// FPS Counter using requestAnimationFrame
export class FPSCounter {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private rafId: number = 0;
  private callback: (fps: number, avgFps: number) => void;
  private isRunning: boolean = false;
  private fpsHistory: number[] = [];

  constructor(callback: (fps: number, avgFps: number) => void) {
    this.callback = callback;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.fpsHistory = [];
    this.tick();
  }

  private tick = () => {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.frameCount++;
    
    if (delta >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / delta);
      this.fpsHistory.push(fps);
      
      // Keep last 30 seconds of history for averaging
      if (this.fpsHistory.length > 30) {
        this.fpsHistory.shift();
      }
      
      const avgFps = Math.round(
        this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
      );
      
      this.callback(fps, avgFps);
      this.frameCount = 0;
      this.lastTime = now;
    }
    
    this.rafId = requestAnimationFrame(this.tick);
  };

  stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.rafId);
  }
}

// Memory tracker (Chrome only)
export function getMemoryUsage(): number {
  // @ts-expect-error - Chrome-specific API
  const memory = performance.memory;
  if (memory) {
    return Math.round(memory.usedJSHeapSize / 1024 / 1024);
  }
  return 0;
}

// Create a render counter hook
export function createRenderCounter() {
  let count = 0;
  let lastRenderTime = 0;
  
  return {
    increment: () => {
      const start = performance.now();
      count++;
      lastRenderTime = performance.now() - start;
    },
    getCount: () => count,
    getLastRenderTime: () => lastRenderTime,
    reset: () => {
      count = 0;
      lastRenderTime = 0;
    },
  };
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Scroll performance tester
export class ScrollTester {
  private container: HTMLElement | null = null;
  private scrollPositions: number[] = [];
  private scrollTimes: number[] = [];

  setContainer(element: HTMLElement | null) {
    this.container = element;
  }

  async runScrollTest(
    onProgress: (progress: number) => void
  ): Promise<{ avgScrollTime: number; maxScrollTime: number }> {
    if (!this.container) {
      return { avgScrollTime: 0, maxScrollTime: 0 };
    }

    const totalHeight = this.container.scrollHeight;
    const step = 100;
    const steps = Math.ceil(totalHeight / step);

    this.scrollPositions = [];
    this.scrollTimes = [];

    for (let i = 0; i < steps; i++) {
      const start = performance.now();
      window.scrollTo({ top: i * step, behavior: 'instant' });
      await new Promise((r) => requestAnimationFrame(r));
      const end = performance.now();
      
      this.scrollTimes.push(end - start);
      this.scrollPositions.push(i * step);
      onProgress((i / steps) * 100);
    }

    const avgScrollTime = this.scrollTimes.reduce((a, b) => a + b, 0) / this.scrollTimes.length;
    const maxScrollTime = Math.max(...this.scrollTimes);

    window.scrollTo({ top: 0 });
    
    return { avgScrollTime, maxScrollTime };
  }
}
