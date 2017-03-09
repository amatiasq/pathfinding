import { IArea } from "./i-area";
import { INode } from "./i-node";


export interface IPathfindingAlgorithm  {
  getPath(start: INode, end: INode, area?: IArea): INode[];
  getCost(start: INode, path: INode[]): number;
}
