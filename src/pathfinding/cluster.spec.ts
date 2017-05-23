import { assert } from 'chai';
import { Vector3D } from '../core/vector3d';
import { Area } from './area';
import { Cluster } from './cluster';
import { INode } from './node';


describe('Cluster class', () => {
  const fakeAlgorithm = {
    resolve(start: INode, end: INode) {
      return [] as INode[];
    },
  };


  it('should not crash on creation', () => {
    assert.doesNotThrow(() => makeCluster(new Vector3D(5, 5, 5), new Vector3D(3, 3, 3)));
  });


  describe('#getEntrances method', () => {
    it('should return only nodes in contact with tiles outside the cluster', () => {
      const { sut, area } = makeCluster(new Vector3D(4, 4, 1), new Vector3D(2, 2, 1));
      const entrances = sut.getEntrances();

      assert.deepEqual(entrances, [
        area.get(new Vector3D(0, 0, 0)),
        area.get(new Vector3D(1, 0, 0)),
        area.get(new Vector3D(0, 1, 0)),
        area.get(new Vector3D(1, 1, 0)),
      ]);
    });

    it('should avoid returning obstacle tiles', () => {
      const { sut, area } = makeCluster(new Vector3D(4, 4, 1), new Vector3D(2, 2, 1));
      area.get(new Vector3D(0, 0, 0)).isObstacle = true;
      area.get(new Vector3D(0, 1, 0)).isObstacle = true;
      const entrances = sut.getEntrances();

      assert.deepEqual(entrances, [
        area.get(new Vector3D(1, 0, 0)),
        area.get(new Vector3D(1, 1, 0)),
      ]);
    });


    it('should avoid returning three adjacent tiles', () => {
      const { sut, area } = makeCluster(new Vector3D(5, 5, 1), new Vector3D(3, 3, 1));
      const entrances = sut.getEntrances();

      assert.deepEqual(entrances, [
        area.get(new Vector3D(0, 0, 0)),
        area.get(new Vector3D(2, 0, 0)),
        area.get(new Vector3D(0, 2, 0)),
        area.get(new Vector3D(2, 2, 0)),
      ]);

      assert.notInclude(entrances, area.get(new Vector3D(0, 0, 1)));
      assert.notInclude(entrances, area.get(new Vector3D(0, 1, 0)));
      assert.notInclude(entrances, area.get(new Vector3D(1, 0, 0)));
      assert.notInclude(entrances, area.get(new Vector3D(1, 1, 1)));
    });
  });


  describe('#getConnections method', () => {
    it('should return a map');
    it('should return the path to each entrance connected to the given node');
  });


  describe('#resolve method', () => {
    it('should resolve path inside it\'s area');
    it('should return null if one of the nodes is not in the cluster');
    it('should return null if there is no connection between the nodes');
  });


  function makeCluster(worldSize: Vector3D, areaSize: Vector3D, algorithm = fakeAlgorithm) {
    const world = new Area<INode>(worldSize, location => ({ location }));
    const area = world.getRange(new Vector3D(1, 1, 0), areaSize);
    const sut = new Cluster(world, area, algorithm);
    return { world, area, sut };
  }
});
