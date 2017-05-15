import { assert } from 'chai';
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
    assert.throws(() => sut.get(1));
  });

  it('should throw if we ask for more dimensions than we have', () => {
    sut = makeMatrix([], [ 2, 2 ]);
    assert.throws(() => sut.get(1, 1, 1));
  });

  it('should have a shape property which returns the size of the matrix', () => {
    sut = makeMatrix([], [ 2, 2 ]);
    const expected = [ 2, 2 ];
    assert.deepEqual<number[]>(sut.shape, expected);
  });

  it('should have a size property which returns the size of the matrix', () => {
    const size = new Vector3D(2, 2, 2);
    vectorSut = makeVectorMatrix([], size);
    assert.instanceOf(vectorSut.size, Vector3D);
    assert.deepEqual(vectorSut.size, size);
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

    testReturnsUndefined('any bigger combination', [
      [ 1, 2 ],
      [ 2, 1 ],
      [ 2, 2 ],
    ]);

    testReturnsUndefined('negative indexes', [
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

    testReturnsUndefined('any bigger combination', [
      [ 1, 1, 2 ],
      [ 1, 2, 1 ],
      [ 1, 2, 2 ],
      [ 2, 1, 2 ],
      [ 2, 2, 1 ],
      [ 2, 2, 2 ],
    ]);

    testReturnsUndefined('negative indexes', [
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
      assert.equal(child.get(0, 0), sut.get(1, 1));
    });

    it('should automatically reduce the shape of the new matrix', () => {
      const child = sut.getRange([ 1, 1 ]);
      assert.deepEqual(child.shape, [ 3, 3 ]);
    });

    it('returned matrix should be able to slice properly too', () => {
      const child = sut.getRange([ 1, 1 ]);
      const subchild = child.getRange([ 2, 2 ]);
      assert.equal(subchild.get(0, 0), sut.get(3, 3));
    });

    it('should accept a size restriction', () => {
      const child = sut.getRange([ 1, 1 ], [ 2, 2 ]);
      assert.deepEqual(child.shape, [ 2, 2 ]);
      assert.isUndefined(child.get(2, 2));
    });
  });


  function makeVectorMatrix<T, U>(data: T[], dimensions: IVector) {
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
      assert.equal(actual, expected);
    });
  }

  function testAssignement(run: IndexCombination) {
    it(`should set the element index ${run.expectedIndex} if I set (${run.coords})`, () => {
      const newObject = {};
      sut.set(newObject, ...run.coords);
      const actual = data[run.expectedIndex];
      assert.equal(actual, newObject);
    });
  }

  function testIndexGetterAsVector(run: IndexCombination) {
    it(`should return the element index ${run.expectedIndex} if I ask for vector (${run.coords})`, () => {
      const expected = data[run.expectedIndex];
      const actual = vectorSut.getVector(run.vector);
      assert.equal(actual, expected);
    });
  }

  function testAssignementAsVector(run: IndexCombination) {
    it(`should set the element index ${run.expectedIndex} if I set vector (${run.coords})`, () => {
      const newObject = {};
      vectorSut.setVector(newObject, run.vector);
      const actual = data[run.expectedIndex];
      assert.equal(actual, newObject);
    });
  }

  function testReturnsUndefined(reason: string, cases: number[][]) {
    it(`should return undefined for ${reason}`, () => {
      cases.forEach(coords => assert.isUndefined(sut.get(...coords)));
    });
  }
});


interface IndexCombination {
  expectedIndex: number;
  coords: number[];
  vector?: Vector | Vector3D;
}
