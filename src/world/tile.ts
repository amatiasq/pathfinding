import { IPrintable } from "../interfaces";
import { drawSquare, fillSquare } from "../utils";
import { Color } from "../config";


export default class Tile implements IPrintable {
  public color: string;


  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly size: number,
    private _travelCost: number,
  ) {}


  get isObstacle(): boolean {
    return this.travelCost === 1;
  }

  get travelCost(): number {
    return this._travelCost;
  }


  isNeighbor(other: Tile) {
    if (this.x === other.x)
      return Math.abs(this.y - other.y) === 1;

    if (this.y === other.y)
      return Math.abs(this.x - other.x) === 1;
    
    return false;
  }

  print(ctx: CanvasRenderingContext2D): void {
    drawSquare(ctx, this.x * this.size, this.y * this.size, this.size, {
      color: Color.TILE.toString(),
    });

    if (this.isObstacle)
      fillSquare(ctx, this.x * this.size, this.y * this.size, this.size);

    if (this.color)
      fillSquare(ctx, this.x * this.size, this.y * this.size, this.size, { color: this.color });
  }

  toString() {
    return `{x:${this.x},y:${this.y}}`;
  }
}