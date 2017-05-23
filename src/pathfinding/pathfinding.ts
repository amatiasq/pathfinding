import { Area } from './area';
import { INode } from './node';
import { ITile } from './tile';


export class Pathfinding<T extends ITile> {

  constructor(
    private world: Area<T>,
    private algorithm: IPathfindingAlgorithm<T>,
  ) {}


  resolve(origin: T, destination: T): T[] {
    return this.algorithm.resolve(origin, destination, this.world) || null;
  }
}


export interface IPathfindingAlgorithm<T extends INode> {
  resolve(origin: T, destination: T, area?: Area<T>): T[];
}
