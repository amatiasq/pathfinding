import { Area } from './area';
import { ITile } from './tile';


export class Pathfinding<T extends ITile> {

  constructor(
    private world: Area<T>,
  ) {}


  // tslint:disable-next-line:prefer-function-over-method
  resolve(origin: T, destination: T): T[] {
    if (this.world.areNeighbors(origin, destination))
      return [ destination ];

    return [];
  }
}
