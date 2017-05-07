import { IArea } from "./i-area";
import Vector3D from "../core/vector3d";


export interface IPathfindingNode {
  readonly travelCost: number;
  getNeighbors(area?: IArea): IPathfindingNode[];
  getCostTo(neighbor: IPathfindingNode): number;
  estimateDistanceTo(node: IPathfindingNode): number;
}


export interface IPathfindingTile extends IPathfindingNode {
  readonly location: Vector3D;
  readonly isObstacle: boolean;
  isNeighbor(node: IPathfindingNode): boolean;

  // debug
  // color: string;
  // content: string;
}
