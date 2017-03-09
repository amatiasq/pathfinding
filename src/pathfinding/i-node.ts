import Vector from "../core/vector";
import { IArea } from "./i-area";


export interface INode {
  readonly location: Vector;
  readonly travelCost: number;
  readonly isObstacle: boolean;
  getCostTo(neighbor: INode): number;
  isNeighbor(node: INode): boolean;
  getNeighbors(area?: IArea): Map<INode, INodeRelation>;
  estimateDistanceTo(node: INode): number;
}


export interface ITile extends INode {
  // debug
  color: string;
  content: string;
}


export interface INodeRelation {
  cost: number;
  childA?: INode;
  childB?: INode;
}
