import { IArea } from "./i-area";
import { IPathfindingNode } from "./i-pathfinding-node";


export interface IPathfindingAlgorithm  {
  getPath(start: IPathfindingNode, end: IPathfindingNode, area?: IArea): IPathfindingNode[];
  getCost(start: IPathfindingNode, path: IPathfindingNode[]): number;
}
