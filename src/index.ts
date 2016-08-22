/// <reference path="../node_modules/phaser/typescript/phaser.comments.d.ts" />
import { Game, AUTO } from 'phaser';
import {
  WORLD_HEIGHT,
  WORLD_WIDTH,
  CELL_SIZE,
} from './constants';
import GameState from "./states/game-state";


window.addEventListener('load', () => gameStart());


function gameStart() {
  const game = new Game(WORLD_WIDTH, WORLD_HEIGHT, AUTO);
  game.state.add('Game', new GameState());
  game.state.start('Game');
  (<any>window).game = game;
}
