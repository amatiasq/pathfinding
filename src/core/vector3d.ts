import { degreesToRadians, round } from './helpers';
import { IVector, VectorSetter, VectorTest } from './vector';


export interface IVector3D extends IVector {
  readonly z: number;

  is({ x, y, z }: Vector3DSetter): boolean;
  set({ x, y, z }: Vector3DSetter): IVector3D;
  add({ x, y, z }: Vector3DSetter): IVector3D;
  sustract({ x, y, z }: Vector3DSetter): IVector3D;
  multiply({ x, y, z }: Vector3DSetter): IVector3D;
  divide({ x, y, z }: Vector3DSetter): IVector3D;

  isValue(x: number, y?: number, z?: number): boolean;
  setValue(x: number, y?: number, z?: number): IVector3D;
  addValue(x: number, y?: number, z?: number): IVector3D;
  sustractValue(x: number, y?: number, z?: number): IVector3D;
  multiplyValue(x: number, y?: number, z?: number): IVector3D;
  divideValue(x: number, y?: number, z?: number): IVector3D;

  apply(operation: (coord: number) => number): IVector3D;

  clone(): IVector3D;
  toImmutable(): IVector3D;
  toMutable(): IVector3D;
}


abstract class BaseVector3D<T extends IVector3D> implements IVector3D {
  static readonly round = round;

  static *iterate(vectorA: IVector3D, vectorB: IVector3D = new Vector3D(0, 0, 0)) {
    const start = this.apply(Math.min, vectorA, vectorB);
    const end = this.apply(Math.max, vectorA, vectorB);
    const current = new MutableVector3D(0, 0, 0);

    for (current.z = start.z; current.z < end.z; current.z++)
      for (current.y = start.y; current.y < end.y; current.y++)
        for (current.x = start.x; current.x < end.x; current.x++)
          yield current.toImmutable();
  }

  static apply(action: (...values: number[]) => number, ...vectors: IVector3D[]) {
    return new Vector3D(
      action(...vectors.map(vector => vector.x)),
      action(...vectors.map(vector => vector.y)),
      action(...vectors.map(vector => vector.z)),
    );
  }

  static fromMagnitude(value: number): BaseVector3D<IVector3D> {
    return this.construct(value, 0, 0);
  }

  static merge(vectorA: IVector3D, vectorB: IVector3D, ...others: IVector3D[]): BaseVector3D<IVector3D> {
    let x = vectorA.x + vectorB.x;
    let y = vectorA.y + vectorB.y;
    let z = vectorA.z + vectorB.z;

    if (others.length) {
      for (const vector of others) {
        x += vector.x;
        y += vector.y;
        z += vector.z;
      }
    }

    return this.construct(x, y, z);
  }

  static diff(vectorA: IVector3D, vectorB: IVector3D, ...others: IVector3D[]): BaseVector3D<IVector3D> {
    let x = vectorA.x - vectorB.x;
    let y = vectorA.y - vectorB.y;
    let z = vectorA.z - vectorB.z;

    if (others.length) {
      for (const vector of others) {
        x -= vector.x;
        y -= vector.y;
        z -= vector.z;
      }
    }

    return this.construct(x, y, z);
  }

  private static construct(x: number, y: number, z: number): BaseVector3D<IVector3D> {
    // We need to use any because it's going to be a subclass and we can't use
    //   BaseVector3D because it's abstract
    // tslint:disable-next-line:no-any
    return new (this as any)(x, y, z);
  }


  readonly DIMENSIONS: 3;
  readonly x: number;
  readonly y: number;
  readonly z: number;


  constructor(x: number, y: number, z: number) {
    this.x = round(x);
    this.y = round(y);
    this.z = round(z);
  }


  get isZero(): boolean {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }

  get magnitude(): number {
    return this.isZero ? 0 : Math.hypot(this.x, this.y, this.z);
  }


  is({ x = this.x, y = this.y, z = this.z }: Vector3DSetter): boolean {
    return this.x === x && this.y === y && this.z === z;
  }
  isValue(x: number, y = x, z = y): boolean {
    return this.x === x && this.y === y && this.z === z;
  }

  set({ x = this.x, y = this.y, z = this.z }: Vector3DSetter): T {
    return this.setValue(x, y, z);
  }
  abstract setValue(x: number, y?: number, z?: number): T;

  add({ x = 0, y = 0, z = 0 }: Vector3DSetter): T {
    return this.setValue(this.x + x, this.y + y, this.z + z);
  }
  addValue(x: number, y = x, z = y): T {
    return this.setValue(this.x + x, this.y + y, this.z + z);
  }

  sustract({ x = 0, y = 0, z = 0 }: Vector3DSetter): T {
    return this.setValue(this.x - x, this.y - y, this.z - z);
  }
  sustractValue(x: number, y = x, z = y): T {
    return this.setValue(this.x - x, this.y - y, this.z - z);
  }

  multiply({ x = 1, y = 1, z = 1 }: Vector3DSetter): T {
    return this.setValue(this.x * x, this.y * y, this.z * z);
  }
  multiplyValue(x: number, y = x, z = y): T {
    return this.setValue(this.x * x, this.y * y, this.z * z);
  }

  divide({ x = 1, y = 1, z = 1 }: Vector3DSetter): T {
    return this.setValue(this.x / x, this.y / y, this.z / z);
  }
  divideValue(x: number, y = x, z = y): T {
    return this.setValue(this.x / x, this.y / y, this.z / z);
  }


  apply(operation: (coord: number) => number): T {
    return this.setValue(operation(this.x), operation(this.y), operation(this.z));
  }
  every(operation: VectorTest): boolean {
    return operation(this.x) && operation(this.y) && operation(this.z);
  }
  some(operation: VectorTest): boolean {
    return operation(this.x) || operation(this.y) || operation(this.z);
  }

  abstract clone(): T;
  toImmutable(): Vector3D {
    return new Vector3D(this.x, this.y, this.z);
  }
  toMutable(): MutableVector3D {
    return new MutableVector3D(this.x, this.y, this.z);
  }

  toString(): string {
    return `[Vector3D(${this.x},${this.y},${this.z})]`;
  }
  toArray(): number[] {
    return [ this.x, this.y, this.z ];
  }
  toJSON(): string {
    return `{x:${this.x},y:${this.y},z:${this.z}}`;
  }
}


/*
 * This version of Vector is immutable, any method that requires a modification
 * of the properties will return a new Vector.
 * If you want mutability you can import { MutableVector } instead
 */
export class Vector3D extends BaseVector3D<Vector3D> implements IVector3D {
  static ZERO = new Vector3D(0, 0, 0);
  static MAX = new Vector3D(Infinity, Infinity, Infinity);

  // tslint:disable-next-line:prefer-function-over-method
  setValue(x: number, y = x, z = y): Vector3D {
    return new Vector3D(x, y, z);
  }

  clone() {
    return new Vector3D(this.x, this.y, this.z);
  }
}


export class MutableVector3D extends BaseVector3D<MutableVector3D> implements IVector3D {
  x: number;
  y: number;
  z: number;


  setValue(x: number, y = x, z = y): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  clone() {
    return new MutableVector3D(this.x, this.y, this.z);
  }
}


interface IZSetter {
  x?: number;
  y?: number;
  z: number;
}

type Vector3DSetter = VectorSetter | IZSetter;
