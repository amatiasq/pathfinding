import State = Phaser.State;
import {
  ROWS,
  COLUMNS,
  CELL_SIZE,
} from '../constants';
import Grid from "../prefabs/grid";
import Cell from "../prefabs/cell";
import Group = Phaser.Group;
import Pathfinding from "../prefabs/pathfinding";
import Timer = Phaser.Timer;


const PAUSE = 100;


export default class GameState extends State {
  private grid: Grid<Cell>;
  private cells: Group;
  private pathfinding: Pathfinding<Cell>;
  private start: Cell;
  private end: Cell;
  private completed: boolean;

  init() {
    const cellBitmapdata = this.add.bitmapData(CELL_SIZE, CELL_SIZE);
    const ctx = cellBitmapdata.ctx;
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#DDD';
    ctx.beginPath();
    ctx.rect(0, 0, CELL_SIZE, CELL_SIZE);
    ctx.fill();
    ctx.stroke();

    this.cells = this.add.group();
    this.grid = new Grid<Cell>(COLUMNS, ROWS);
    this.grid.fill((row: number, col: number) => {
      const cell = new Cell(
        this.game,
        row * CELL_SIZE,
        col * CELL_SIZE,
        cellBitmapdata,
        row,
        col,
        1
      );
      this.cells.add(cell);
      return cell;
    });

    for (let i = 1; i < COLUMNS - 1; i++)
      this.grid.getCell(i, Math.floor(ROWS / 2)).weight = 0;

    this.restart();
  }

  restart() {
    this.grid.forEach((cell: Cell, x: number, y: number) => {
      cell.tint = cell.isObstacle ? 0x0 : 0xFFFFFF;
      cell.inputEnabled = true;
      cell.events.onInputDown.add(this.toggleCell, this);
    });

    this.start = this.grid.getCell(1, 1);
    this.end = this.grid.getCell(COLUMNS - 2, ROWS - 2);
    this.pathfinding = new Pathfinding<Cell>(this.grid, this.start.position, this.end.position);
    this.completed = false;
    this.next();
  }

  next() {
    const path = this.pathfinding.next();
    if (!this.completed && !path)
      return this.time.events.add(PAUSE, this.next, this);

    this.completed = true;
    const pathColor = 0xFF00FF;
    this.start.tint = pathColor;

    if (path)
      path.forEach((cell: Cell) => cell.tint = pathColor);
  }

  private toggleCell(cell: Cell) {
    cell.weight = cell.weight ? 0 : 1;
    this.restart();
  }
}
