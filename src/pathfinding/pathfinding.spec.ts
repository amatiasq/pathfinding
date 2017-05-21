import { assert } from 'chai';
import { Vector3D } from '../core/vector3d';
import { AStar } from './a-star';
import { Area } from './area';
import { INode } from './node';
import { Pathfinding } from './pathfinding';
import { ITile } from './tile';


const LAYER_CHANGE_COST = 2;
const DIAGONAL_MOVEMENT_COST = Math.SQRT2;


const measurer = {
  estimateDistance(from: INode, to: INode) {
    return from.location.sustract(to.location).magnitude;
  },

  getNeighborCost(from: INode, to: INode) {
    const distance = from.location.sustract(to.location).apply(Math.abs);

    if (distance.z === 1)
      return LAYER_CHANGE_COST;

    if (distance.y === 1 && distance.x === 1)
      return DIAGONAL_MOVEMENT_COST;

    return 1;
  },
};


describe('Pathfinding module', () => {
  it('should return empty array if origin and destination nodes are the same', () => {
    const origin = new Vector3D(0, 0, 0);
    const { path } = calculatePath(origin, origin, []);

    assert.isArray(path);
    assert.equal(path.length, 0);
  });


  it('should return an array with destination only if origin and destination are neighbors', () => {
    const origin = new Vector3D(0, 0, 0);
    const destination = origin.add({ x: 1 });
    const { path, expected } = calculatePath(origin, destination, [ destination ]);

    assert.deepEqual(path[0], expected[0]);
  });


  it('should return the nodes required to jump to in order to travel from origin to destination', () => {
    const origin = new Vector3D(0, 0, 0);
    const destination = origin.add({ x: 2 });
    const { path, expected } = calculatePath(origin, destination, [
      origin.add({ x: 1 }),
      destination,
    ], {
      worldSize: new Vector3D(3, 2, 1),
    });

    assert.deepEqual(path, expected);
  });


  it('should avoid obstacle nodes in the path', () => {
    const origin = new Vector3D(0, 0, 0);
    const destination = origin.add({ x: 2 });
    const { path, expected } = calculatePath(origin, destination, [
      origin.add({ x: 1, y: 1 }),
      origin.add({ x: 2 }),
    ], {
      worldSize: new Vector3D(3, 2, 1),
      modifier(world) {
        world.get(origin.add({ x: 1 })).isObstacle = true;
      },
    });

    assert.deepEqual(path, expected);
  });


  it('should return null if there is no route without obstacles', () => {
    const origin = new Vector3D(0, 0, 0);
    const destination = origin.add({ x: 2 });
    const { path } = calculatePath(origin, destination, [], {
      modifier(world) {
        world.get(origin.add({ x: 1 })).isObstacle = true;
      },
    });

    assert.isNull(path);
  });


  it('should return the shortest path between origin and destination', () => {
    const origin = new Vector3D(0, 0, 0);
    const destination = origin.add({ x: 4, y: 4 });
    const { path, expected } = calculatePath(origin, destination, [
      origin.add({ x: 1, y: 1 }),
      origin.add({ x: 2, y: 2 }),
      origin.add({ x: 3, y: 3 }),
      destination,
    ], {
      modifier(world) {
        world.get(origin.add({ x: 1, y: 3 })).isObstacle = true;
        world.get(origin.add({ x: 3, y: 1 })).isObstacle = true;
      },
    });

    assert.deepEqual(path, expected);
  });


  it('should be able to travel up and down if node below has a ramp and node above is empty');
  it('should not travel up and down between neighbors if node below has no ramp');
  it('should not travel up and down between neighbors if node above is not empty');
  it('should consider layer change as expensive as designed in LAYER_CHANGE_COST parameter');


  function calculatePath(
    originLocation: Vector3D,
    destinationLocation: Vector3D,
    expectedPath: Vector3D[],
    {
      worldSize,
      modifier,
    }: {
      worldSize?: Vector3D,
      modifier?(world: Area<ITile>): void,
    } = {},
  ) {
    const minSize = Vector3D.apply(Math.max, originLocation, destinationLocation);
    const world = new Area(worldSize || minSize.addValue(1), location => ({ location }));
    const algorithm = new AStar<INode>(measurer);
    const sut = new Pathfinding(world, algorithm);
    const origin = world.get(originLocation);
    const destination = world.get(destinationLocation);
    const expected = expectedPath.map(location => world.get(location));

    if (modifier)
      modifier(world);

    const path = sut.resolve(origin, destination);

    return { world, sut, origin, destination, path, expected };
  }
});

