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
    const sut = makeArea(dataSize, spy);
    assert.equal(spy.callCount, size);
  });


  it('should return the node created by nodeCreator at the giving coordinates', () => {
    const sut = makeArea();
    assert.deepPropertyVal(sut.get(new Vector3D(0, 0, 0)), 'value', 0);
    assert.deepPropertyVal(sut.get(new Vector3D(1, 0, 0)), 'value', 1);
    assert.deepPropertyVal(sut.get(new Vector3D(1, 1, 0)), 'value', 3);
    assert.deepPropertyVal(sut.get(new Vector3D(1, 1, 1)), 'value', 7);
  });


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
    const sut = makeArea(new Vector3D(3, 3, 1), obstacleCreator(location => location.isEqual(target)));
    const neighbors = sut.getNeighbors(sut.get(target));
    assert.equal(neighbors.length, 0);
  });


  it('should exclude neighbors with obstacles', () => {
    const target = new Vector3D(1, 1, 0);
    const neighbor = new Vector3D(0, 1, 0);
    const filter = obstacleCreator(location => !location.isEqual(target) && !location.isEqual(neighbor));
    const sut = makeArea(new Vector3D(3, 3, 1), filter);
    const neighbors = sut.getNeighbors(sut.get(target));
    assert.equal(neighbors.length, 1);
    assert.include(neighbors, sut.get(neighbor));
  });


  it('should include neighbor of node above if node has a ramp and neighbor above is empty', () => {
    const target = new Vector3D(1, 1, 0);
    const above = new Vector3D(1, 1, 1);
    const filter = obstacleCreator(location => !location.isEqual(target) && location.z !== 1);
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
    const sut = makeArea(new Vector3D(3, 3, 2), obstacleCreator(location => false));

    sut.get(neighbor).isEmpty = true;
    sut.get(below).canTravelUp = true;
    const neighbors = sut.getNeighbors(sut.get(target));

    assert.include(neighbors, sut.get(below));
  });


  function makeArea(
    dataSize: Vector3D = new Vector3D(2, 2, 2),
    nodeCreator: NodeCreator<INode, number> = defaultNodeCreator,
  ) {
    const list = [];
    const size = dataSize.z * dataSize.y * dataSize.x;

    for (let i = 0; i < size; i++)
      list.push(i);

    const data = new VectorMatrix(list, dataSize);
    return new Area<INode, number>(data, nodeCreator);
  }


  function obstacleCreator(filter: (location: Vector3D) => boolean): NodeCreator<INode, number> {
    return (value: number, location: Vector3D): IMockNode => {
      return {
        isObstacle: filter(location),
        canTravelUp: false,
        isEmpty: false,
        location,
        value,
      };
    };
  }


  interface IMockNode extends INode {
    value: number;
  }
});
