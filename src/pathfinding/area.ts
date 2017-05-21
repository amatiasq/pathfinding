
import { VectorMatrix } from '../core/matrix';
import { IVector3D, Vector3D } from '../core/vector3d';
import { INode } from './node';


export class Area<T extends INode> {
  private tiles: VectorMatrix<T, IVector3D>;


  constructor(data: VectorMatrix<T, IVector3D>);
  constructor(size: Vector3D, creator: NodeCreator<T>);
  constructor(_: VectorMatrix<T, IVector3D> | IVector3D, creator?: NodeCreator<T>) {
    if (_ instanceof VectorMatrix) {
      this.tiles = _;
      return;
    }

    const size = _;
    this.tiles = new VectorMatrix([] as T[], size);

    for (const index of Vector3D.iterate(size))
      this.tiles.setVector(creator(index), index);
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


export type NodeCreator<T> = (location: Vector3D) => T;
