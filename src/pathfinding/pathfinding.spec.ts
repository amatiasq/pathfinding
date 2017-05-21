/*
import { VectorMatrix } from '../core/matrix';
import { Vector3D } from '../core/vector3d';
import { Area } from './area';
import { INode } from './node';
import { Pathfinding } from './pathfinding';

describe('Pathfinding module', () => {
  let sut: Pathfinding;
  let world: Area<INode, number>;

  beforeEach(() => {
  });

  it('should return empty array if origin and destination nodes are the same', () => {
    sut = new Pathfinding();
    world = new Area(new Vector(1, 1, 1), location => ({ location }));


    const origin = world.get(new Vector3D(0, 0, 0));
    const destination = origin;
    sut.getPath(origin, destination);
  });

  it('should return an array with destination only if origin and destination are neighbors');
  it('should return the nodes required to jump to in order to travel from origin to destination');
  it('should avoid obstacle nodes in the path');
  it('should return null if there is no route without obstacles');
  it('should return the shortest path between origin and destination');
  it('should be able to travel up and down if node below has a ramp and node above is empty');
  it('should not travel up and down between neighbors if node below has no ramp');
  it('should not travel up and down between neighbors if node above is not empty');
  it('should consider layer change as expensive as designed in LAYER_CHANGE_COST parameter');
});
*/
