import { Side } from "../config";
import { INode } from "./i-node";
import { Vector3D } from "../core";


export interface IArea {
  readonly size: Vector3D;
  getRange(position: Vector3D, size: Vector3D): IArea;
  getNeighbor(tile: INode, direction: Side): INode;
  getNeighbors(tile: INode): INode[];
  getEdge(faceA: Side, faceB: Side): INode[];
  getFace(face: Side): INode[];
}
