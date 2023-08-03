import { Board, Direction, TileIndex } from "./Board";
import { Confetti, ConfettiOptions } from "./confetti";
import "./scss/global.scss";

console.log("Connected!");

const boardEl = document.getElementById("board") as HTMLDivElement;
const tileTemplate = document.getElementById(
  "tile-template"
) as HTMLTemplateElement;

let tileEls: HTMLDivElement[][];

const board = new Board(
  [
    [1, 2, null],
    [4, 5, 3],
    [7, 8, 6],
  ],
  [0, 2]
);

function renderBoard(board: Board) {
  const [sizeX, sizeY] = board.size;
  for (let i = 0; i < sizeX; i++)
    for (let j = 0; j < sizeY; j++) {
      const tile = board.tiles[i][j];
      const tileEl = tileEls[i][j];
      if (tile === null) tileEl.classList.add("empty");
      else tileEl.classList.remove("empty");
      tileEl.textContent = (tile ?? "").toString();
      tileEl.style.gridArea = `${i + 1} / ${j + 1}`;
      tileEl.style.cursor = getCursor([i, j]);
    }
}

function reRenderTile([i, j]: TileIndex) {
  const tile = board.tiles[i][j];
  const tileEl = tileEls[i][j];
  if (tile === null) tileEl.classList.add("empty");
  else tileEl.classList.remove("empty");
  tileEl.textContent = (tile ?? "").toString();
  tileEl.style.gridArea = `${i + 1} / ${j + 1}`;
  tileEl.style.cursor = getCursor([i, j]);
}

function getCursor(tile: TileIndex) {
  const direction = board.getAllowedMove(tile);
  if (direction === null) return "not-allowed";
  switch (direction) {
    case Direction.Up:
      return "n-resize";
    case Direction.Down:
      return "s-resize";
    case Direction.Left:
      return "w-resize";
    case Direction.Right:
      return "e-resize";
  }
}

function initializeBoard(board: Board) {
  const [sizeX, sizeY] = board.size;
  tileEls = [];
  for (let i = 0; i < sizeX; i++) {
    tileEls.push([]);
    for (let j = 0; j < sizeY; j++) {
      const tile = board.tiles[i][j];
      const tileEl = tileTemplate.content.firstElementChild?.cloneNode(
        true
      ) as HTMLDivElement;
      tileEl.addEventListener("click", () => handleMouseClick([i, j]));
      if (tile === null) tileEl.classList.add("empty");
      tileEl.textContent = (tile ?? "").toString();
      tileEl.style.gridArea = `${i + 1} / ${j + 1}`;
      tileEl.style.cursor = getCursor([i, j]);
      tileEls[i].push(tileEl);
      boardEl.appendChild(tileEl);
    }
  }
}

function handleMouseClick(tile: [number, number]) {
  const direction = board.getAllowedMove(tile);
  if (direction === null) {
    animate(tileEls[tile[0]][tile[1]], ["no-move"], 500);
    return;
  }
  animate(
    tileEls[tile[0]][tile[1]],
    ["moving", Direction[direction]],
    500,
    () => {
      board.moveTile(tile, direction);
      tileEls[tile[0]][tile[1]].classList.remove(
        "moving",
        Direction[direction]
      );
      renderBoard(board);
      board.isSolved() && confetti.addConfetti(window.innerWidth / 2, 100);
    }
  );
}

function animate(
  element: HTMLElement,
  classList: string[],
  duration: number,
  callback: () => void = () => {}
) {
  element.classList.add(...classList);
  setTimeout(() => {
    element.classList.remove(...classList);
    callback();
  }, duration);
}

// Initialize the canvas and its 2D context
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const confettiOptions: Partial<ConfettiOptions> = {
  gravity: 0.2,
  maxParticles: 500,
  minSize: 8,
  maxSize: 20,
  minSpeedX: -5,
  maxSpeedX: 5,
  minSpeedY: -30,
  maxSpeedY: -15,
  minRotation: -20,
  maxRotation: 20,
};

const confetti = new Confetti(ctx, confettiOptions);

function main() {
  initializeBoard(board);
}
main();
