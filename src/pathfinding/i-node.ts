import { IArea } from "./i-area";
import { IAStarNode } from "./a-star";
import Vector3D from "../core/vector3d";


export interface INode extends IAStarNode {
  readonly location: Vector3D;
  readonly travelCost: number;
  readonly isObstacle: boolean;
  isNeighbor(node: INode): boolean;
  getNeighbors(area?: IArea): INode[];
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
