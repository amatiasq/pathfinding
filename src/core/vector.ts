export interface IVector {
  readonly x: number;
  readonly y: number;
  readonly isZero: boolean;
  readonly radians: number;
  readonly degrees: number;
  readonly magnitude: number;

  add(x: number, y?: number): IVector;
  sustract(x: number, y?: number): IVector;
  multiply(x: number, y?: number): IVector;
  divide(x: number, y?: number): IVector;
  merge(other: IVector): IVector;
  diff(other: IVector): IVector;
  round(): IVector;
  abs(): IVector;
  apply(operation: (value: number) => number): IVector;
  toJSON(): string;
  toString(): string;
}


abstract class BaseVector<T extends IVector> implements IVector {
  public readonly x: number;
  public readonly y: number;
  public static readonly round = round;

  static fromRadians(radians: number): BaseVector<IVector> {
    return new (this as any)(Math.cos(radians), Math.sin(radians));
  }

  static fromDegrees(degrees: number): BaseVector<IVector> {
    return this.fromRadians(degreesToRadians(degrees));
  }

  static fromMagnitude(value: number): BaseVector<IVector> {
    return new (this as any)(value, 0);
  }

  static from(degrees: number, magnitude: number): BaseVector<IVector> {
    const vector = this.fromDegrees(degrees);
    return new (this as any)(vector.x * magnitude, vector.y * magnitude);
  }

  static merge(vectorA: IVector, vectorB: IVector, ...others: IVector[]): BaseVector<IVector> {
    let x = vectorA.x + vectorB.x;
    let y = vectorA.y + vectorB.y;

    if (others.length) {
      for (const vector of others) {
        x += vector.x;
        y += vector.y;
      }
    }

    return new (this as any)(x, y);
  }

  static diff(vectorA: IVector, vectorB: IVector, ...others: IVector[]): BaseVector<IVector> {
    let x = vectorA.x - vectorB.x;
    let y = vectorA.y - vectorB.y;

    if (others.length) {
      for (const vector of others) {
        x -= vector.x;
        y -= vector.y;
      }
    }

    return new (this as any)(x, y);
  }


  constructor(x: number, y: number) {
    this.x = round(x);
    this.y = round(y);
  }


  get isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }

  get radians(): number {
    if (this.isZero)
      return 0;

    let arctan = Math.atan(this.y / this.x);

    if (arctan < 0)
      arctan += Math.PI;

    if (this.y < 0 || (this.y === 0 && this.x < 0))
      arctan += Math.PI;

    return arctan;
  }

  get degrees(): number {
    const degrees = (this.radians / Math.PI * 180) % 360;
    return degrees < 0 ? degrees + 360 : degrees;
  }

  get magnitude(): number {
    return this.isZero ? 0 : round(Math.sqrt(this.x * this.x + this.y * this.y));
  }


  toJSON(): string {
    return `{x:${this.x},y:${this.y}}`;
  }

  toString(): string {
    return `[Vector(${this.x},${this.y})]`;
  }

  add(x: number, y: number = x): T {
    return this.set(this.x + x, this.y + y);
  }

  sustract(x: number, y: number = x): T {
    return this.set(this.x - x, this.y - y);
  }

  multiply(x: number, y: number = x): T {
    return this.set(this.x * x, this.y * y);
  }

  divide(x: number, y: number = x): T {
    return this.set(this.x / x, this.y / y);
  }

  merge(other: IVector): T {
    return this.set(this.x + other.x, this.y + other.y);
  }

  diff(other: IVector): T {
    return this.set(this.x - other.x, this.y - other.y);
  }

  round(): T {
    return this.set(round(this.x), round(this.y));
  }

  abs(): T {
    return this.apply(Math.abs);
  }

  apply(operation: (value: number) => number): T {
    return this.set(operation(this.x), operation(this.y));
  }

  protected abstract set(x: number, y: number): T;
}


/*
 * This version of Vector is immutable, any method that requires a modification
 * of the properties will return a new Vector.
 * If you want mutability you can import { MutableVector } instead
 */
export default class Vector extends BaseVector<Vector> implements IVector {
  public static ZERO = new Vector(0, 0);
  public static MAX = new Vector(Infinity, Infinity);

  protected set(x: number, y: number): Vector {
    return new Vector(x, y);
  }

  toMutable(): MutableVector {
    return new MutableVector(this.x, this.y);
  }
}



export class MutableVector extends BaseVector<MutableVector> implements IVector {
  public x: number;
  public y: number;


  set radians(value: number) {
    const magnitude = this.magnitude;
    this.x = Math.cos(value) * magnitude;
    this.y = Math.sin(value) * magnitude;
  }

  set degrees(value: number) {
    this.radians = degreesToRadians(value);
  }

  set magnitude(value: number) {
    const prevMagnitude = this.magnitude;
    this.x = Math.cos(value) * prevMagnitude;
    this.y = Math.sin(value) * prevMagnitude;
  }

  protected set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  clone() {
    return new MutableVector(this.x, this.y);
  }

  toImmutable(): Vector {
    return new Vector(this.x, this.y);
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
