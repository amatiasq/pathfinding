import { degreesToRadians, round, DEGREES_IN_PI_RADIANS, MAX_DEGREES } from './helpers';


export interface IVector {
  readonly DIMENSIONS: number;
  readonly x: number;
  readonly y: number;
  readonly isZero: boolean;
  readonly magnitude: number;

  /*
  readonly radians: number;
  readonly degrees: number;
  */

  is(x: number, y: number): boolean;
  isEqual(vector: IVector): boolean;
  add(x: number, y?: number): IVector;
  sustract(x: number, y?: number): IVector;
  multiply(x: number, y?: number): IVector;
  divide(x: number, y?: number): IVector;
  merge(other: IVector): IVector;
  diff(other: IVector): IVector;
  round(): IVector;
  abs(): IVector;
  apply(operation: (value: number) => number): IVector;
  clone(): IVector;
  toJSON(): string;
  toString(): string;
  toArray(): number[];
  toImmutable(): IVector;
  toMutable(): IVector;
}


abstract class BaseVector<T extends IVector> implements IVector {
  static readonly round = round;

  static fromRadians(radians: number): BaseVector<IVector> {
    return this.construct(Math.cos(radians), Math.sin(radians));
  }

  static fromDegrees(degrees: number): BaseVector<IVector> {
    return this.fromRadians(degreesToRadians(degrees));
  }

  static fromMagnitude(value: number): BaseVector<IVector> {
    return this.construct(value, 0);
  }

  static from(degrees: number, magnitude: number): BaseVector<IVector> {
    const vector = this.fromDegrees(degrees);
    return this.construct(vector.x * magnitude, vector.y * magnitude);
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

    return this.construct(x, y);
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

    return this.construct(x, y);
  }

  private static construct(x: number, y: number): BaseVector<IVector> {
    // We need to use any because it's going to be a subclass and we can't use
    //   BaseVector because it's abstract
    // tslint:disable-next-line:no-any
    return new (this as any)(x, y);
  }


  readonly DIMENSIONS: 2;
  readonly x: number;
  readonly y: number;


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
    const degrees = (this.radians / Math.PI * DEGREES_IN_PI_RADIANS) % MAX_DEGREES;
    return degrees < 0 ? degrees + MAX_DEGREES : degrees;
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

  toArray(): number[] {
    return [ this.x, this.y ];
  }

  is(x: number, y: number): boolean {
    return this.x === x && this.y === y;
  }

  isEqual(vector: IVector): boolean {
    return this.x === vector.x && this.y === vector.y;
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

  abstract clone(): T;
  abstract toImmutable(): Vector;
  abstract toMutable(): MutableVector;
  protected abstract set(x: number, y: number): T;
}


/**
 * This version of Vector is immutable, any method that requires a modification
 * of the properties will return a new Vector.
 * If you want mutability you can import { MutableVector } instead
 */
export class Vector extends BaseVector<Vector> implements IVector {
  static ZERO = new Vector(0, 0);
  static MAX = new Vector(Infinity, Infinity);

  // This method doesn't use this because this implementation is inmutable
  //   It can be mutable in other implementations.
  // tslint:disable-next-line:prefer-function-over-method
  protected set(x: number, y: number): Vector {
    return new Vector(x, y);
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  toImmutable(): Vector {
    return this;
  }

  toMutable(): MutableVector {
    return new MutableVector(this.x, this.y);
  }
}


export class MutableVector extends BaseVector<MutableVector> implements IVector {
  x: number;
  y: number;


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

  toMutable(): MutableVector {
    return this.clone();
  }
}
