import Sprite = Phaser.Sprite;
import BitmapData = Phaser.BitmapData;
import Point = Phaser.Point;
import { INode } from "./grid";
import Game = Phaser.Game;
import Text = Phaser.Text;


export default class Cell extends Sprite implements INode {
  gridPosition: Point;
  parentNode: Cell;
  gCost: number;
  hCost: number;
  private text: Text;

  get fCost() {
    return this.gCost + this.hCost * 2;
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

    const styles = { font: '14px Arial', fill: '#00F' };
    this.text = this.game.add.text(this.x + this.width / 2, this.y + this.height / 2, '', styles);
    this.text.anchor.setTo(0.5);
  }

  update() {
    super.update();
    this.text.text = `${this.fCost}\n${this.gCost}+${this.hCost}`;
  }

  toString() {
    return `x:${this.gridPosition.x},y:${this.gridPosition.y}`;
  }
}