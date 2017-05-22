// tslint:disable:max-line-length

import { assert } from 'chai';
import * as sinon from 'sinon';
import { VectorMatrix } from '../core/matrix';
import { Vector3D } from '../core/vector3d';
import { Area, NodeCreator } from './area';
import { INode } from './node';


describe('Area class', () => {
  const defaultNodeCreator = obstacleCreator(() => false);


  it('should invoke the callback given to the constructor for each node in the area', () => {
    const spy = sinon.spy();
    const dataSize = new Vector3D(2, 2, 2);
    const size = dataSize.z * dataSize.y * dataSize.x;
    makeArea(dataSize, spy);
    assert.equal(spy.callCount, size);
  });


  it('should return the node created by nodeCreator at the giving coordinates', () => {
    const sut = makeArea();
    assert.deepPropertyVal(sut.get(new Vector3D(0, 0, 0)), 'index', 0);
    assert.deepPropertyVal(sut.get(new Vector3D(1, 0, 0)), 'index', 1);
    assert.deepPropertyVal(sut.get(new Vector3D(1, 1, 0)), 'index', 3);
    assert.deepPropertyVal(sut.get(new Vector3D(1, 1, 1)), 'index', 7);
  });


  describe('#areNeighbors method', () => {
    it('should return true if two nodes are separated by no tiles', () => {
      testNeighbors(new Vector3D(0, 0, 0), new Vector3D(1, 0, 0), true);
    });


    it('should return false if one of the nodes is an obstacle', () => {
      testNeighbors(new Vector3D(0, 0, 0), new Vector3D(1, 0, 0), false, nodeA => nodeA.isObstacle = true);
    });


    it('should return false if nodes are separated by one or more tiles', () => {
      testNeighbors(new Vector3D(0, 0, 0), new Vector3D(2, 0, 0), false);
      testNeighbors(new Vector3D(0, 0, 0), new Vector3D(0, 2, 0), false);
      testNeighbors(new Vector3D(0, 0, 0), new Vector3D(0, 0, 2), false);
    });


    it('should return false if nodes are on a different layer and node below can not travel up', () => {
      testNeighbors(new Vector3D(0, 0, 0), new Vector3D(0, 0, 1), false, (nodeA, nodeB, above) => above.isEmpty = true);
    });


    it('should return false if nodes are on a different layer and node above is not empty', () => {
      testNeighbors(new Vector3D(0, 0, 0), new Vector3D(0, 0, 1), false, nodeA => nodeA.canTravelUp = true);
    });


    it('should return true if nodes are on a different layer but node below can travel up and node above it is empty', () => {
      testNeighbors(new Vector3D(0, 0, 0), new Vector3D(0, 0, 1), true, (nodeA, nodeB, above) => {
        nodeA.canTravelUp = true;
        above.isEmpty = true;
      });
    });


    it('should return true if nodes are valid neighbors on different layers but one is not immediately above the other', () => {
      testNeighbors(new Vector3D(0, 0, 0), new Vector3D(1, 1, 1), true, (nodeA, nodeB, above) => {
        nodeA.canTravelUp = true;
        above.isEmpty = true;
      });
    });


    it('should return false if both nodes are the same', () => {
      testNeighbors(new Vector3D(0, 0, 0), new Vector3D(0, 0, 0), false);
    });


    function testNeighbors(
      locationA: Vector3D,
      locationB: Vector3D,
      expected: boolean,
      operator?: (nodeA: INode, nodeB: INode, above: INode) => void,
    ) {
      const size = Vector3D.apply(Math.max, locationA, locationB);
      const sut = makeArea(size.addValue(1));
      const nodeA = sut.get(locationA);
      const nodeB = sut.get(locationB);

      if (operator) {
        const above = sut.get(locationA.add({ z: 1 }));
        operator(nodeA, nodeB, above);
      }

      assert.equal(sut.areNeighbors(nodeA, nodeB), expected);
      assert.equal(sut.areNeighbors(nodeB, nodeA), expected);
    }
  });


  describe('#getNeighbors method', () => {
    it('should return all neighbors adjacent to a given node', () => {
      const sut = makeArea(new Vector3D(5, 5, 1));
      const node = sut.get(new Vector3D(2, 2, 0));
      const neighbors = sut.getNeighbors(node);

      assert.equal(neighbors.length, 8);
      assert.include(neighbors, sut.get(new Vector3D(1, 1, 0)));
      assert.include(neighbors, sut.get(new Vector3D(1, 2, 0)));
      assert.include(neighbors, sut.get(new Vector3D(1, 3, 0)));
      assert.include(neighbors, sut.get(new Vector3D(2, 1, 0)));
      assert.include(neighbors, sut.get(new Vector3D(2, 3, 0)));
      assert.include(neighbors, sut.get(new Vector3D(3, 1, 0)));
      assert.include(neighbors, sut.get(new Vector3D(3, 2, 0)));
      assert.include(neighbors, sut.get(new Vector3D(3, 3, 0)));
    });


    it('should return empty array if node is obstacle', () => {
      const target = new Vector3D(1, 1, 0);
      const sut = makeArea(new Vector3D(3, 3, 1), obstacleCreator(location => location.is(target)));
      const neighbors = sut.getNeighbors(sut.get(target));
      assert.equal(neighbors.length, 0);
    });


    it('should exclude neighbors with obstacles', () => {
      const target = new Vector3D(1, 1, 0);
      const neighbor = new Vector3D(0, 1, 0);
      const filter = obstacleCreator(location => !location.is(target) && !location.is(neighbor));
      const sut = makeArea(new Vector3D(3, 3, 1), filter);
      const neighbors = sut.getNeighbors(sut.get(target));
      assert.equal(neighbors.length, 1);
      assert.include(neighbors, sut.get(neighbor));
    });


    it('should include neighbor of node above if node has a ramp and neighbor above is empty', () => {
      const target = new Vector3D(1, 1, 0);
      const above = new Vector3D(1, 1, 1);
      const filter = obstacleCreator(location => !location.is(target) && location.z !== 1);
      const sut = makeArea(new Vector3D(3, 3, 2), filter);

      sut.get(target).canTravelUp = true;
      sut.get(above).isEmpty = true;
      const neighbors = sut.getNeighbors(sut.get(target));

      assert.equal(neighbors.length, 8);
      assert(neighbors.every(node => node.location.z === 1));
    });


    it('should include neighbor below if a direct neighbor is empty and node below has a ramp', () => {
      const target = new Vector3D(1, 1, 1);
      const neighbor = new Vector3D(1, 2, 1);
      const below = new Vector3D(1, 2, 0);
      const sut = makeArea(new Vector3D(3, 3, 2));

      sut.get(neighbor).isEmpty = true;
      sut.get(below).canTravelUp = true;
      const neighbors = sut.getNeighbors(sut.get(target));

      assert.include(neighbors, sut.get(below));
    });


    it('should return empty array if node has no neighbors', () => {
      const target = new Vector3D(0, 0, 0);
      const sut = makeArea(new Vector3D(1, 1, 1));
      const neighbors = sut.getNeighbors(sut.get(target));

      assert.isArray(neighbors);
      assert.equal(neighbors.length, 0);
    });


    it('should return the node below if node is empty and node below has a ramp', () => {
      const target = new Vector3D(1, 0, 1);
      const below = new Vector3D(0, 0, 0);
      const sut = makeArea(new Vector3D(2, 1, 2));

      sut.get(below).canTravelUp = true;
      sut.get(new Vector3D(0, 0, 1)).isEmpty = true;
      const neighbors = sut.getNeighbors(sut.get(target));

      assert.include(neighbors, sut.get(below));
    });


    it('should return no neighbors if neighbor is empty and node below does not have a ramp', () => {
      const target = new Vector3D(1, 0, 1);
      const sut = makeArea(new Vector3D(2, 1, 2));

      sut.get(new Vector3D(0, 0, 1)).isEmpty = true;
      const neighbors = sut.getNeighbors(sut.get(target));

      assert.isArray(neighbors);
      assert.equal(neighbors.length, 0);
    });
  });


  describe('#getRange method', () => {
    it('should return a new Area', () => {
      const { sut, range } = makeRange(new Vector3D(5, 5, 5), new Vector3D(1, 1, 1));

      assert.instanceOf(range, Area);
      assert.notEqual(sut, range);
    });


    it('should return ignore all nodes before `offset`', () => {
      const offset = new Vector3D(1, 1, 1);
      const { sut, range } = makeRange(new Vector3D(5, 5, 5), offset);

      assert.equal(sut.get(offset), range.get(new Vector3D(0, 0, 0)));
      assert.equal(sut.get(new Vector3D(1, 1, 2)), range.get(new Vector3D(0, 0, 1)));
      assert.equal(sut.get(new Vector3D(1, 2, 1)), range.get(new Vector3D(0, 1, 0)));
      assert.equal(sut.get(new Vector3D(2, 1, 1)), range.get(new Vector3D(1, 0, 0)));
    });


    it('should include to the last tile if no size is provided', () => {
      const { range, maxSize } = makeRange(new Vector3D(5, 5, 5), new Vector3D(1, 1, 1));

      assert.deepEqual(range.size, maxSize);
    });


    it('should limit the results to the requested output size', () => {
      const requestedSize = new Vector3D(2, 2, 2);
      const { range } = makeRange(new Vector3D(5, 5, 5), new Vector3D(1, 1, 1), requestedSize);

      assert.deepEqual(range.size, requestedSize);
    });


    it('should return a list with every possible tile even if the Area is smaller than requested size', () => {
      const { range } = makeRange(new Vector3D(2, 2, 2), new Vector3D(1, 1, 1), new Vector3D(5, 5, 5));

      assert.deepEqual(range.size, new Vector3D(1, 1, 1));
    });


    function makeRange(worldSize: Vector3D, offset: Vector3D, size?: Vector3D) {
      const sut = makeArea(worldSize);
      const range = sut.getRange(offset, size);
      const maxSize = worldSize.sustract(offset);
      return { sut, range, maxSize };
    }
  });


  function makeArea(dataSize = new Vector3D(2, 2, 2), nodeCreator = defaultNodeCreator) {
    return new Area<INode>(dataSize, nodeCreator);
  }


  function obstacleCreator(filter: (location: Vector3D) => boolean): NodeCreator<INode> {
    let index = 0;

    return (location: Vector3D): IMockNode => {
      return {
        isObstacle: filter(location),
        location,
        index: index++,
      };
    };
  }


  interface IMockNode extends INode {
    index: number;
  }
});
