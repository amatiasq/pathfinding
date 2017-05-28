import { Vector3D } from '../core/vector3d';
import { AStar } from './a-star';
import { measurer } from './a-star.mock';
import { Area } from './area';
import { Cluster } from './cluster';
import { INode } from './node';


describe('Cluster class', () => {
  it('should not crash on creation', () => {
    expect(() => makeCluster(new Vector3D(5, 5, 5), new Vector3D(3, 3, 3)))
      .not.toThrowError();
  });


  describe('#getEntrances method', () => {
    it('should return only nodes in contact with tiles outside the cluster', () => {
      const { sut, area } = makeCluster(new Vector3D(4, 4, 1), new Vector3D(2, 2, 1));
      const entrances = sut.getEntrances();

      expect(entrances).toEqual([
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

      expect(entrances).toEqual([
        area.get(new Vector3D(1, 0, 0)),
        area.get(new Vector3D(1, 1, 0)),
      ]);
    });


    it('should avoid returning three adjacent tiles', () => {
      const { sut, area } = makeCluster();
      const entrances = sut.getEntrances();

      expect(entrances).toEqual([
        area.get(new Vector3D(0, 0, 0)),
        area.get(new Vector3D(2, 0, 0)),
        area.get(new Vector3D(0, 2, 0)),
        area.get(new Vector3D(2, 2, 0)),
      ]);

      expect(entrances).not.toContain(area.get(new Vector3D(0, 0, 1)));
      expect(entrances).not.toContain(area.get(new Vector3D(0, 1, 0)));
      expect(entrances).not.toContain(area.get(new Vector3D(1, 0, 0)));
      expect(entrances).not.toContain(area.get(new Vector3D(1, 1, 1)));
    });
  });


  describe('#getConnections method', () => {
    it('should return a map', () => {
      const { sut, area } = makeCluster();
      const sample = area.get(new Vector3D(0, 0, 0));
      const connections = sut.getConnections(sample);
      expect(connections).toBeInstanceOf(Map);
    });


    it('should return the path to each entrance connected to the given node', () => {
      const { area, sut } = makeCluster();
      const sample = area.get(new Vector3D(0, 0, 0));
      const connections = sut.getConnections(sample);

      const step1 = area.get(new Vector3D(1, 0, 0));
      const target1 = area.get(new Vector3D(2, 0, 0));
      const step2 = area.get(new Vector3D(0, 1, 0));
      const target2 = area.get(new Vector3D(0, 2, 0));

      expect(connections.get(target1)).toEqual([ step1, target1 ]);
      expect(connections.get(target2)).toEqual([ step2, target2 ]);
    });
  });


  describe('#resolve method', () => {
    it('should resolve path inside it\'s area', () => {
      const { area, sut } = makeCluster();
      const sample = area.get(new Vector3D(0, 0, 0));
      const step = area.get(new Vector3D(1, 0, 0));
      const target = area.get(new Vector3D(2, 0, 0));
      const path = sut.resolve(sample, target);

      expect(path).toEqual([ step, target ]);
    });


    it('should return null if one of the nodes is not in the cluster', () => {
      const { world, area, sut } = makeCluster();
      const inside = area.get(new Vector3D(0, 0, 0));
      const outside = world.get(new Vector3D(0, 0, 0));

      expect(sut.resolve(inside, outside)).toBeNull();
      expect(sut.resolve(outside, inside)).toBeNull();
    });


    it('should return null if there is no connection between the nodes', () => {
      const { area, sut } = makeCluster();
      const start = area.get(new Vector3D(0, 0, 0));
      const end = area.get(new Vector3D(2, 2, 0));

      area.get(new Vector3D(0, 1, 0)).isObstacle = true;
      area.get(new Vector3D(1, 1, 0)).isObstacle = true;
      area.get(new Vector3D(2, 1, 0)).isObstacle = true;

      expect(sut.resolve(start, end)).toBeNull();
    });
  });


  function makeCluster(worldSize = new Vector3D(5, 5, 1), areaSize = new Vector3D(3, 3, 1)) {
    const algorithm = new AStar<INode>(measurer);
    const world = new Area<INode>(worldSize, location => ({ location }));
    const area = world.getRange(new Vector3D(1, 1, 0), areaSize);
    const sut = new Cluster(world, area, algorithm);
    return { world, area, sut };
  }
});
