export class FrameScheduler {
  private clean = true;

  private frames = [] as any[];

  private raf = -1;

  private run() {
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => {
      const frame = this.frames.shift();
      if (frame) frame();

      if (frames.length) this.run();
      else this.clean = true;
    });
  }

  public requestNewFrame(callback: () => void) {
    if (!this.clean || this.frames.length) {
      this.frames.push(callback);
      this.run();
    } else {
      this.clean = false;
      callback();
      this.run();
    }
  }
}
