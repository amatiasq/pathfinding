
import { VectorMatrix } from '../core/matrix';
import { IVector3D, Vector3D } from '../core/vector3d';
import { INode } from './node';


export class Area<T extends INode, U> {
  private tiles: VectorMatrix<T, IVector3D>;


  constructor(data: VectorMatrix<U, IVector3D>, nodeCreator: NodeCreator<T, U>) {
    this.tiles = new VectorMatrix([] as T[], data.size);


    for (let i = 0; i < data.size.x; i++) {
      for (let j = 0; j < data.size.y; j++) {
        for (let k = 0; k < data.size.z; k++) {
          const location = new Vector3D(i, j, k);
          const node = nodeCreator(data.getVector(location), location);
          this.tiles.setVector(node, location);
        }
      }
    }
  }

  get(location: IVector3D): T {
    return this.tiles.getVector(location);
  }

  getNeighbors(node: T): T[] {
    if (node.isObstacle)
      return [];

    const neighbors = this.getLayerNeighbors(node).map(neighbor => {
      if (!neighbor.isEmpty)
        return neighbor;

      const locationBelow = neighbor.location.toMutable();
      locationBelow.z--;

      const below = this.get(locationBelow);
      if (below.canTravelUp)
        return below;
    });

    if (node.canTravelUp) {
      const locationAbove = node.location.toMutable();
      locationAbove.z++;

      const above = this.get(locationAbove);
      if (above && above.isEmpty)
        neighbors.push(...this.getLayerNeighbors(above));
    }

    return neighbors;
  }

  private getLayerNeighbors(node: T): T[] {
    const neighbors = [];
    const location = node.location.toMutable();

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        location.x = node.location.x + i;
        location.y = node.location.y + j;
        const neighbor = this.get(location);

        if (!neighbor.isObstacle)
          neighbors.push(neighbor);
      }
    }

    return neighbors;
  }
}


export type NodeCreator<T, U> = (value: U, location: Vector3D) => T;
