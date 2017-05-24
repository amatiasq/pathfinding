import { Matrix, VectorMatrix } from './matrix';
import { IVector, Vector } from './vector';
import { Vector3D } from './vector3d';


describe('Matrix component', () => {
  let data: object[];
  let sut: Matrix<object>;
  let vectorSut: VectorMatrix<object, IVector>;


  afterEach(() => data = sut = vectorSut = null);


  it('should throw if we ask for less dimensions than we have', () => {
    sut = makeMatrix([], [ 2, 2 ]);
    expect(() => sut.get(1)).toThrowError();
  });

  it('should throw if we ask for more dimensions than we have', () => {
    sut = makeMatrix([], [ 2, 2 ]);
    expect(() => sut.get(1, 1, 1)).toThrowError();
  });

  it('should have a shape property which returns the size of the matrix', () => {
    sut = makeMatrix([], [ 2, 2 ]);
    expect(sut.shape).toEqual([ 2, 2 ]);
  });

  it('should have a size property which returns the size of the matrix', () => {
    const size = new Vector3D(2, 2, 2);
    vectorSut = makeVectorMatrix([], size);
    expect(vectorSut.size).toBeInstanceOf(Vector3D);
    expect(vectorSut.size).toEqual(size);
  });

  it.skip('should return null if one of the values is negative', () => {
    // TODO: Negative values might return last indexes
    sut = makeMatrix([ { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }], [ 2, 2 ]);
    expect(sut.get(1, -1)).toBeUndefined();
  });


  describe('simple two by two matrix', () => {
    beforeEach(() => {
      data = makeData(2 * 2);
      sut = vectorSut = makeVectorMatrix(data, new Vector(2, 2));
    });

    const runs: IndexCombination[] = [
      { coords: [ 0, 0 ], expectedIndex: 0 },
      { coords: [ 0, 1 ], expectedIndex: 1 },
      { coords: [ 1, 0 ], expectedIndex: 2 },
      { coords: [ 1, 1 ], expectedIndex: 3 },
    ];

    runs.forEach(run => run.vector = new Vector(run.coords[1], run.coords[0]));

    runs.forEach(testIndexGetter);
    runs.forEach(testAssignement);
    runs.forEach(testIndexGetterAsVector);
    runs.forEach(testAssignementAsVector);

    testReturnsNull('any bigger combination', [
      [ 1, 2 ],
      [ 2, 1 ],
      [ 2, 2 ],
    ]);

    testReturnsNull('negative indexes', [
      [ 0, -1 ],
      [ -1, 0 ],
      [ -1, -1 ],
    ]);
  });


  describe('three-dimensional matrix', () => {
    beforeEach(() => {
      data = makeData(2 * 2 * 2);
      sut = vectorSut = makeVectorMatrix(data, new Vector3D(2, 2, 2));
    });

    const runs: IndexCombination[] = [
      { coords: [ 0, 0, 0 ], expectedIndex: 0 },
      { coords: [ 0, 0, 1 ], expectedIndex: 1 },
      { coords: [ 0, 1, 0 ], expectedIndex: 2 },
      { coords: [ 0, 1, 1 ], expectedIndex: 3 },
      { coords: [ 1, 0, 0 ], expectedIndex: 4 },
      { coords: [ 1, 0, 1 ], expectedIndex: 5 },
      { coords: [ 1, 1, 0 ], expectedIndex: 6 },
      { coords: [ 1, 1, 1 ], expectedIndex: 7 },
    ];

    runs.forEach(run => run.vector = new Vector3D(run.coords[2], run.coords[1], run.coords[0]));

    runs.forEach(testIndexGetter);
    runs.forEach(testAssignement);
    runs.forEach(testIndexGetterAsVector);
    runs.forEach(testAssignementAsVector);

    testReturnsNull('any bigger combination', [
      [ 1, 1, 2 ],
      [ 1, 2, 1 ],
      [ 1, 2, 2 ],
      [ 2, 1, 2 ],
      [ 2, 2, 1 ],
      [ 2, 2, 2 ],
    ]);

    testReturnsNull('negative indexes', [
      [ 0, 0, -1 ],
      [ 0, -1, 0 ],
      [ 0, -1, -1 ],
      [ -1, 0, -1 ],
      [ -1, -1, 0 ],
      [ -1, -1, -1 ],
    ]);
  });


  describe('I should be able to get a subsection of the matrix', () => {
    beforeEach(() => {
      const DIMENSION_SIZE = 4;
      data = makeData(DIMENSION_SIZE * DIMENSION_SIZE);
      sut = vectorSut = makeVectorMatrix(data, new Vector(DIMENSION_SIZE, DIMENSION_SIZE));
    });

    it('should index from the subsection', () => {
      const child = sut.getRange([ 1, 1 ]);
      expect(child.shape).toEqual([ 3, 3 ]);
    });

    it('returned matrix should be able to slice properly too', () => {
      const child = sut.getRange([ 1, 1 ]);
      const subchild = child.getRange([ 2, 2 ]);
      expect(subchild.get(0, 0)).toBe(sut.get(3, 3));
    });

    it('should accept a size restriction', () => {
      const child = sut.getRange([ 1, 1 ], [ 2, 2 ]);
      expect(child.shape).toEqual([ 2, 2 ]);
      expect(child.get(2, 2)).toBeNull();
    });
  });


  describe('#toArray method', () => {
    it('should return all tiles in the area', () => {
      const dimensions = new Vector(2, 2);
      const size = dimensions.x * dimensions.y;
      const data = makeData(4);
      const sut = makeVectorMatrix(data, dimensions);
      const array = sut.toArray();

      expect(array.length).toBe(size);
      for (const index of Vector.iterate(dimensions))
        expect(array).toContain(sut.getVector(index));
    });


    it('should return empty array if area has no tile', () => {
      const sut = makeMatrix([], [ 0, 0 ]);
      const array = sut.toArray();
      expect(array.length).toBe(0);
    });
  });


  describe('bug check', () => {
    it('should return null when getting items out of range', () => {
      const data = makeData(4);
      const sut = makeVectorMatrix(data, new Vector3D(2, 1, 2));

      expect(sut.getVector(new Vector3D(0, 1, 0))).toBeNull();
      expect(sut.getVector(new Vector3D(1, 1, 0))).toBeNull();
    });


    it('should throw when trying to set items out of range', () => {
      const data = makeData(4);
      const sut = makeVectorMatrix(data, new Vector3D(2, 1, 2));

      expect(() => sut.setVector(null, new Vector3D(1, 1, 1))).toThrow();
    });
  });


  function makeVectorMatrix<T>(data: T[], dimensions: IVector) {
    return new VectorMatrix(data, dimensions);
  }

  function makeMatrix<T>(data: T[], dimensions: number[]) {
    return new Matrix(data, dimensions);
  }

  function makeData(length: number) {
    const result = [];

    for (let i = 0; i < length; i++)
      result.push({ sample: i });

    return result;
  }

  function testIndexGetter(run: IndexCombination) {
    it(`should return the element index ${run.expectedIndex} if I ask for (${run.coords})`, () => {
      const expected = data[run.expectedIndex];
      const actual = sut.get(...run.coords);
      expect(actual).toBe(expected);
    });
  }

  function testAssignement(run: IndexCombination) {
    it(`should set the element index ${run.expectedIndex} if I set (${run.coords})`, () => {
      const newObject = {};
      sut.set(newObject, ...run.coords);
      const actual = data[run.expectedIndex];
      expect(actual).toBe(newObject);
    });
  }

  function testIndexGetterAsVector(run: IndexCombination) {
    it(`should return the element index ${run.expectedIndex} if I ask for vector (${run.coords})`, () => {
      const expected = data[run.expectedIndex];
      const actual = vectorSut.getVector(run.vector);
      expect(actual).toBe(expected);
    });
  }

  function testAssignementAsVector(run: IndexCombination) {
    it(`should set the element index ${run.expectedIndex} if I set vector (${run.coords})`, () => {
      const newObject = {};
      vectorSut.setVector(newObject, run.vector);
      const actual = data[run.expectedIndex];
      expect(actual).toBe(newObject);
    });
  }

  function testReturnsNull(reason: string, cases: number[][]) {
    it(`should return null for ${reason}`, () => {
      cases.forEach(coords => expect(sut.get(...coords)).toBeNull());
    });
  }
});


interface IndexCombination {
  expectedIndex: number;
  coords: number[];
  vector?: Vector | Vector3D;
}
