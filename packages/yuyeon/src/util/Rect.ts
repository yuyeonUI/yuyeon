export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  get top(): number;
  get bottom(): number;
  get left(): number;
  get right(): number;
}

export class MutableRect implements Rect {
  public x: number;

  public y: number;

  public width: number;

  public height: number

  constructor({ x, y, width, height }: { x: number, y: number, width: number, height: number }) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.width = width ?? 0;
    this.height = height ?? 0;
  }

  public get top(): number {
    return this.y;
  }

  public get bottom(): number {
    return this.y + this.height;
  }

  public get left(): number {
    return this.x;
  }

  public get right(): number {
    return this.x + this.width;
  }
}
