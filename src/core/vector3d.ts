import { IVector } from "./vector";

export interface IVector3D extends IVector {
  readonly z: number;

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
  public readonly DIMENSIONS: 3;
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;
  public static readonly round = round;

  static fromMagnitude(value: number): BaseVector3D<IVector3D> {
    return new (this as any)(value, 0, 0);
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

    return new (this as any)(x, y, z);
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

    return new (this as any)(x, y, z);
  }


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

    // we must do "Math.sqrt(plain) * Math.sqrt(plain)" which simplifies to "plain"
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
    return [ this.x, this.y, this.z ];
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

  protected abstract set(x: number, y: number, z: number): T;
}



/*
 * This version of Vector is immutable, any method that requires a modification
 * of the properties will return a new Vector.
 * If you want mutability you can import { MutableVector } instead
 */
export class Vector3D extends BaseVector3D<Vector3D> implements IVector3D {
  public static ZERO = new Vector3D(0, 0, 0);
  public static MAX = new Vector3D(Infinity, Infinity, Infinity);

  protected set(x: number, y: number, z: number): Vector3D {
    return new Vector3D(x, y, z);
  }

  toMutable(): MutableVector3D {
    return new MutableVector3D(this.x, this.y, this.z);
  }
}



export class MutableVector3D extends BaseVector3D<MutableVector3D> implements IVector3D {
  public x: number;
  public y: number;
  public z: number;


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
}



function degreesToRadians(degrees: number): number {
  degrees = degrees % 360;

  if (degrees < 0)
    degrees += 360;

  return degrees * Math.PI / 180;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
