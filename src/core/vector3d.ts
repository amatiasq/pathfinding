import { degreesToRadians, round } from './helpers';
import { IVector } from './vector';


export interface IVector3D extends IVector {
  readonly z: number;

  is(x: number, y: number, z?: number): boolean;
  isEqual(vector: IVector3D): boolean;
  add(x: number, y?: number, z?: number): IVector3D;
  sustract(x: number, y?: number, z?: number): IVector3D;
  multiply(x: number, y?: number, z?: number): IVector3D;
  divide(x: number, y?: number, z?: number): IVector3D;
  merge(other: IVector3D): IVector3D;
  diff(other: IVector3D): IVector3D;
  round(): IVector3D;
  abs(): IVector3D;
  apply(operation: (value: number) => number): IVector3D;
}


abstract class BaseVector3D<T extends IVector3D> implements IVector3D {
  static readonly round = round;

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
    if (this.isZero)
      return 0;

    // We must do "Math.sqrt(plain) * Math.sqrt(plain)" which simplifies to "plain"
    const plain = this.x * this.x + this.y * this.y;
    return round(Math.sqrt(plain + this.z * this.z));
  }


  toJSON(): string {
    return `{x:${this.x},y:${this.y},z:${this.z}}`;
  }

  toString(): string {
    return `[Vector3D(${this.x},${this.y},${this.z})]`;
  }

  toArray(): number[] {
    return [ this.x, this.y, this.z ];
  }


  is(x: number, y: number, z?: number): boolean {
    return this.x === x && this.y === y && this.z === z;
  }

  isEqual(vector: IVector3D): boolean {
    return this.x === vector.x && this.y === vector.y && this.z === vector.z;
  }

  add(x: number, y: number = x, z: number = x): T {
    return this.set(this.x + x, this.y + y, this.z + z);
  }

  sustract(x: number, y: number = x, z: number = x): T {
    return this.set(this.x - x, this.y - y, this.z - z);
  }

  multiply(x: number, y: number = x, z: number = x): T {
    return this.set(this.x * x, this.y * y, this.z * z);
  }

  divide(x: number, y: number = x, z: number = x): T {
    return this.set(this.x / x, this.y / y, this.z / z);
  }

  merge(other: IVector3D): T {
    return this.set(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  diff(other: IVector3D): T {
    return this.set(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  round(): T {
    return this.apply(round);
  }

  abs(): T {
    return this.apply(Math.abs);
  }

  apply(operation: (value: number) => number): T {
    return this.set(operation(this.x), operation(this.y), operation(this.z));
  }

  abstract clone(): T;
  abstract toImmutable(): Vector3D;
  abstract toMutable(): MutableVector3D;
  protected abstract set(x: number, y: number, z: number): T;
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
  protected set(x: number, y: number, z: number): Vector3D {
    return new Vector3D(x, y, z);
  }

  clone() {
    return new Vector3D(this.x, this.y, this.z);
  }

  toImmutable(): Vector3D {
    return this;
  }

  toMutable(): MutableVector3D {
    return new MutableVector3D(this.x, this.y, this.z);
  }
}


export class MutableVector3D extends BaseVector3D<MutableVector3D> implements IVector3D {
  x: number;
  y: number;
  z: number;


  protected set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  clone() {
    return new MutableVector3D(this.x, this.y, this.z);
  }

  toImmutable(): Vector3D {
    return new Vector3D(this.x, this.y, this.z);
  }

  toMutable(): MutableVector3D {
    return this.clone();
  }
}
