import { IPrintable } from "../interfaces";
import { drawSquare, fillSquare, round } from "../utils";
import { Color } from "../config";
import { INode, INodeRelation } from "../pathfinding/i-node";
import { World } from "./world";
import { SubclassExpectedError } from "../pathfinding/errors";
import { IArea } from "../pathfinding/i-area";
import Vector from "../core/vector";


export default class Tile implements IPrintable, INode {
  private world: World;
  id: string;
  color: string;
  content: string;


  constructor(
    public readonly location: Vector,
    public readonly size: number,
    private _travelCost: number,
    private readonly diagonalMovementCost: number,
  ) {}


  get isObstacle(): boolean {
    return this.travelCost === 1;
  }

  get travelCost(): number {
    return this._travelCost;
  }


  setWorld(world: World) {
    this.world = world;
  }

  getNeighbors(area: IArea = this.world): Map<INode, INodeRelation> {
    const neighbors = area.getNeighbors(this) as Tile[];
    const result = new Map<INode, INodeRelation>();

    for (const neighbor of neighbors)
      if (!neighbor.isObstacle || neighbor === this)
        result.set(neighbor, { cost: this.isAdjacent(neighbor) ? 1 : this.diagonalMovementCost });

    return result;
  }

  getCostTo(neighbor: INode): number {
    const tile = neighbor as Tile;

    if (this.isAdjacent(tile))
      return 1;
    
    if (this.isDiagonal(tile))
      return this.diagonalMovementCost;
    
    debugger;
    throw new Error('Argument should be a neighbor');
  }

  estimateDistanceTo(tile: Tile): number {
    const diff = Vector.diff(this.location, tile.location).abs();

    const layerMovement = diff.x > diff.y ?
      this.diagonalMovementCost * 10 * diff.y + 10 * (diff.x - diff.y) :
      this.diagonalMovementCost * 10 * diff.x + 10 * (diff.y - diff.x);

    return round(layerMovement); // + z * LAYER_CHANGE_COST;
  }

  isNeighbor(other: INode): boolean {
    if (!(other instanceof Tile))
      throw new SubclassExpectedError(`Expected Tile but ${other.constructor.name} found`);

    return this.isAdjacent(other) || this.isDiagonal(other);
  }

  isAdjacent(other: Tile) {
    return Vector.diff(this.location, other.location).magnitude === 1;
  }

  isDiagonal(other: Tile) {
    return Vector.diff(this.location, other.location).magnitude === Vector.round(Math.SQRT2);
  }

  print(ctx: CanvasRenderingContext2D, drawGrid?: boolean): void {
    const x = this.location.x * this.size;
    const y = this.location.y * this.size;

    if (drawGrid) {
      drawSquare(ctx, x, y, this.size, {
        color: Color.TILE.toString(),
      });
    }

    if (this.isObstacle) {
      ctx.fillStyle = 'black';
      ctx.fillRect(x, y, this.size, this.size);
    }

    if (this.color) {
      ctx.fillStyle = this.color;
      ctx.fillRect(x, y, this.size, this.size);
    }
    
    if (this.content) {
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';
      ctx.fillText(this.content, x + this.size / 2, y + this.size - 2);
    }
  }

  toString() {
    return `[Tile(${this.location.toJSON()})]`;
  }
}
