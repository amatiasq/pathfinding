import { assert } from "chai";
import { Vector } from "./vector"
import { Vector3D } from "./vector3d"
import { VectorMatrix } from "./matrix";


describe("Matrix component", () => {
  let data: object[];
  let sut: VectorMatrix<object>;

  it("should throw if we ask for less dimensions than we have", () => {
    sut = make_matrix([], [ 2, 2 ]);
    assert.throws(() => sut.get(1));
  });

  it("should throw if we ask for more dimensions than we have", () => {
    sut = make_matrix([], [ 2, 2 ]);
    assert.throws(() => sut.get(1, 1, 1));
  });

  it("should have a shape property which returns the size of the matrix", () => {
    sut = make_matrix([], [ 2, 2 ]);
    const expected = [ 2, 2 ];
    assert.deepEqual<number[]>(sut.shape, expected);
  });
  
  describe("simple two by two matrix", () => {
    beforeEach(() => {
      data = make_data(2 * 2);
      sut = make_matrix(data, [ 2, 2 ]);
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

    testReturnsUndefined("any bigger combination", [
      [ 1, 2 ],
      [ 2, 1 ],
      [ 2, 2 ],
    ]);

    testReturnsUndefined("negative indexes", [
      [ 0, -1 ],
      [ -1, 0 ],
      [ -1, -1 ],
    ]);


  });

  describe("three-dimensional matrix", () => {
    beforeEach(() => {
      data = make_data(2 * 2 * 2);
      sut = make_matrix(data, [ 2, 2, 2 ]);
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

    testReturnsUndefined("any bigger combination", [
      [ 1, 1, 2 ],
      [ 1, 2, 1 ],
      [ 1, 2, 2 ],
      [ 2, 1, 2 ],
      [ 2, 2, 1 ],
      [ 2, 2, 2 ],
    ]);

    testReturnsUndefined("negative indexes", [
      [ 0, 0, -1 ],
      [ 0, -1, 0 ],
      [ 0, -1, -1 ],
      [ -1, 0, -1 ],
      [ -1, -1, 0 ],
      [ -1, -1, -1 ],
    ]);
  });

  describe("I should be able to get a subsection of the matrix", () => {
    beforeEach(() => {
      data = make_data(4 * 4);
      sut = make_matrix(data, [ 4, 4 ]);
    });

    it.only("should index from the subsection", () => {
      const child = sut.getRange([ 1, 1 ]);
      assert.equal(child.get(0, 0), sut.get(1, 1));
    });

    it("should automatically reduce the shape of the new matrix", () => {
      const child = sut.getRange([ 1, 1 ]);
      assert.deepEqual(child.shape, [ 3, 3 ]);
    });

    it("returned matrix should be able to slice properly too", () => {
      const child = sut.getRange([ 1, 1 ]);
      const subchild = child.getRange([ 1, 1 ]);
      assert.equal(subchild.get(0, 0), sut.get(2, 2));
    });
  });


  function make_matrix<T>(data: T[], dimensions: number[]) {
    return new VectorMatrix(data, dimensions);
  }

  function make_data(length: number) {
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
      const actual = sut.get(run.vector);
      assert.equal(actual, expected);
    });
  }

  function testAssignementAsVector(run: IndexCombination) {
    it(`should set the element index ${run.expectedIndex} if I set vector (${run.coords})`, () => {
      const newObject = {};
      sut.set(newObject, run.vector);
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
