import { IPrintable } from "../interfaces";
import { drawSquare, fillSquare, round } from "../utils";
import { Color } from "../config";
import { INode, INodeRelation } from "../pathfinding/i-node";
import { World } from "./world";
import { IArea } from "../pathfinding/i-area";
import { Vector3D } from "../core";


export default class Tile implements IPrintable, INode {
  private world: World;
  id: string;
  color: string;
  content: string;


  constructor(
    public readonly location: Vector3D,
    public readonly size: number,
    private _travelCost: number,
    private readonly diagonalMovementCost: number,
    private readonly layerChangeCost: number,
  ) {}


  get isObstacle(): boolean {
    return this.travelCost === 1;
  }

  get travelCost(): number {
    return this._travelCost;
  }

  get canTravelUp(): boolean {
    return !this.isObstacle;
  }

  get canTravelDown(): boolean {
    return !this.isObstacle;
  }


  setWorld(world: World) {
    this.world = world;
  }

  getNeighbors(area: IArea = this.world): Map<INode, INodeRelation> {
    const neighbors = area.getNeighbors(this) as Tile[];
    const result = new Map<INode, INodeRelation>();

    for (const neighbor of neighbors)
      if (!neighbor.isObstacle || neighbor === this)
        result.set(neighbor, { cost: this.getCostTo(neighbor) });

    return result;
  }

  getCostTo(neighbor: INode): number {
    const tile = neighbor as Tile;

    if (this === neighbor)
      return 0;

    if (this.isAdjacent(tile))
      return 1;
    
    if (this.isDiagonal(tile))
      return this.diagonalMovementCost;

    if (this.isAboveOrBelow(tile))
      return this.layerChangeCost;
    
    throw new Error('Argument should be a neighbor');
  }

  estimateDistanceTo(tile: Tile): number {
    const { x, y, z } = Vector3D.diff(this.location, tile.location).abs();

    const layerMovement = x > y ?
      this.diagonalMovementCost * 10 * y + 10 * (x - y) :
      this.diagonalMovementCost * 10 * x + 10 * (y - x);

    return round(layerMovement) + z * this.layerChangeCost;
  }

  isNeighbor(other: INode): boolean {
    if (!(other instanceof Tile))
      throw new TypeError(`Expected Tile but ${other.constructor.name} found`);

    return this.isAdjacent(other) || this.isDiagonal(other);
  }

  isSameLayer(other: Tile) {
    return this.location.z === other.location.z;
  }

  isAdjacent(other: Tile): boolean {
    return (
      this.isSameLayer(other) &&
      Vector3D.diff(this.location, other.location).magnitude === 1
    );
  }

  isDiagonal(other: Tile): boolean {
    return (
      this.isSameLayer(other) &&
      Vector3D.diff(this.location, other.location).magnitude === Vector3D.round(Math.SQRT2)
    );
  }

  isAboveOrBelow(other: Tile): boolean {
    return (
      this.location.x === other.location.x &&
      this.location.y === other.location.y &&
      Math.abs(this.location.z - other.location.z) === 1
    );
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
