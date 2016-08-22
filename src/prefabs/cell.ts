import Sprite = Phaser.Sprite;
import BitmapData = Phaser.BitmapData;
import Point = Phaser.Point;
import { INode } from "./grid";
import Game = Phaser.Game;
import Text = Phaser.Text;
import { CLOSER_MODIFIER } from "../constants";


export default class Cell extends Sprite implements INode {
  gridPosition: Point;
  parentNode: Cell;
  gCost: number;
  hCost: number;
  private text: Text;

  get fCost() {
    return this.gCost + this.hCost * CLOSER_MODIFIER;
  }

  get isObstacle() {
    return this.weight === 0;
  }

  constructor(
    game: Game,
    x: number,
    y: number,
    bitmap: BitmapData,
    gridX: number,
    gridY: number,
    public weight: number
  ) {
    super(game, x, y, bitmap);
    this.gCost = 0;
    this.hCost = 0;
    this.gridPosition = new Point(gridX, gridY);
  }

  toString() {
    return `x:${this.gridPosition.x},y:${this.gridPosition.y}`;
  }
}