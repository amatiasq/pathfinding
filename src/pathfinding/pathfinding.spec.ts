import { assert } from 'chai';
import { Vector3D } from '../core/vector3d';
import { Area } from './area';
import { INode } from './node';
import { Pathfinding } from './pathfinding';
import { ITile } from './tile';

describe('Pathfinding module', () => {
  let sut: Pathfinding<ITile>;
  let world: Area<INode>;


  it('should return empty array if origin and destination nodes are the same', () => {
    world = new Area(new Vector3D(1, 1, 1), location => ({ location }));
    sut = new Pathfinding(world);

    const origin = world.get(new Vector3D(0, 0, 0));
    const destination = origin;
    const path = sut.resolve(origin, destination);

    assert.isArray(path);
    assert.equal(path.length, 0);
  });


  it('should return an array with destination only if origin and destination are neighbors', () => {
    world = new Area(new Vector3D(2, 1, 1), location => ({ location }));
    sut = new Pathfinding(world);

    const origin = world.get(new Vector3D(0, 0, 0));
    const destination = world.get(new Vector3D(1, 0, 0));
    const path = sut.resolve(origin, destination);

    assert.isArray(path);
    assert.equal(path.length, 1);
    assert.deepEqual(path[0], destination);
  });


  it('should return the nodes required to jump to in order to travel from origin to destination');
  it('should avoid obstacle nodes in the path');
  it('should return null if there is no route without obstacles');
  it('should return the shortest path between origin and destination');
  it('should be able to travel up and down if node below has a ramp and node above is empty');
  it('should not travel up and down between neighbors if node below has no ramp');
  it('should not travel up and down between neighbors if node above is not empty');
  it('should consider layer change as expensive as designed in LAYER_CHANGE_COST parameter');
});

