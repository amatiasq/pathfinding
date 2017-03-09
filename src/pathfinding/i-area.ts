import { Side } from "../config";
import { INode } from "./i-node";
import Vector from "../core/vector";


export interface IArea {
  readonly size: Vector;
  getRange(position: Vector, size: Vector): IArea;
  getNeighbor(tile: INode, direction: Side): INode;
  getNeighbors(tile: INode): INode[];
  getRow(y: number): INode[];
  getCol(x: number): INode[];
}
