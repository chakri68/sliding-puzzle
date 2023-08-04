import { AStar } from "./AStar";
import { BFS } from "./BFS";
import { Board, Direction, TileIndex } from "./Board";
import { Confetti, ConfettiOptions } from "./confetti";
import "./scss/global.scss";
import { asyncTimeout } from "./utils";

console.log("Connected!");

const boardEl = document.getElementById("board") as HTMLDivElement;
const tileTemplate = document.getElementById(
  "tile-template"
) as HTMLTemplateElement;

let tileEls: HTMLDivElement[][];

var board = new Board([
  [1, 2, null],
  [4, 5, 3],
  [7, 8, 6],
]);

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

function handleBoardSolve() {
  confetti.addConfetti(window.innerWidth / 2, 100);
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
  boardEl.innerHTML = "";
  const [sizeX, sizeY] = board.size;
  tileEls = [];
  for (let i = 0; i < sizeX; i++) {
    tileEls.push([]);
    for (let j = 0; j < sizeY; j++) {
      const tile = board.tiles[i][j];
      const tileEl = tileTemplate.content.firstElementChild?.cloneNode(
        true
      ) as HTMLDivElement;
      tileEl.addEventListener("click", () => moveTile([i, j]));
      if (tile === null) tileEl.classList.add("empty");
      tileEl.textContent = (tile ?? "").toString();
      tileEl.style.gridArea = `${i + 1} / ${j + 1}`;
      tileEl.style.cursor = getCursor([i, j]);
      tileEls[i].push(tileEl);
      boardEl.appendChild(tileEl);
    }
  }
}

async function moveTile(
  tile: TileIndex,
  dir?: Direction,
  saveToHistory = true
) {
  const direction: Direction | null = dir ?? board.getAllowedMove(tile);
  if (direction === null) {
    animate(tileEls[tile[0]][tile[1]], ["no-move"], 500);
    return;
  }
  await animate(
    tileEls[tile[0]][tile[1]],
    ["moving", Direction[direction]],
    500,
    () => {
      board.moveTile(tile, direction, saveToHistory);
      tileEls[tile[0]][tile[1]].classList.remove(
        "moving",
        Direction[direction]
      );
      renderBoard(board);
      board.isSolved() && handleBoardSolve();
    }
  );
}

async function animate(
  element: HTMLElement,
  classList: string[],
  duration: number,
  callback: () => void = () => {}
) {
  element.classList.add(...classList);
  await asyncTimeout(duration);
  element.classList.remove(...classList);
  callback();
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

// Initiliaze buttons
const shuffleEl = document.getElementById("shuffle") as HTMLButtonElement;
const solveEl = document.getElementById("solve") as HTMLButtonElement;
const resetEl = document.getElementById("reset") as HTMLButtonElement;
const newBoardEl = document.getElementById("new-board") as HTMLButtonElement;

shuffleEl.addEventListener("click", async () => {
  const moves = Board.getMovesForShuffle(board, 25);
  for (const { tile, direction } of moves) {
    await moveTile(tile, direction);
  }
});

solveEl.addEventListener("click", async () => {
  const solution = AStar.solve(board, Board.generate(board.size));
  console.log({ solution });
  if (solution === null) {
    animate(solveEl, ["no-solution"], 500);
    return;
  }
  for (const { tile, direction } of solution) {
    await moveTile(tile, direction, false);
  }
});

resetEl.addEventListener("click", async () => {
  const history = board.getChronologicalHistory();
  for (const { tile, direction } of history) {
    await moveTile(tile, direction, false);
  }
  board.resetHistory();
});

// New board dialog handling
const newBoardDialog = document.getElementById(
  "new-board-dialog"
) as HTMLDialogElement;
const newBoardForm = document.getElementById(
  "new-board-form"
) as HTMLFormElement;
newBoardEl.addEventListener("click", () => {
  newBoardDialog.showModal();
  newBoardDialog.addEventListener("click", handleDialogClose);
});

function handleDialogClose(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLDialogElement).getBoundingClientRect();
  const isInDialog =
    rect.top <= ev.clientY &&
    ev.clientY <= rect.top + rect.height &&
    rect.left <= ev.clientX &&
    ev.clientX <= rect.left + rect.width;
  if (!isInDialog) {
    newBoardDialog.close();
    newBoardForm.reset();
  }
  newBoardDialog.removeEventListener("click", handleDialogClose);
}

newBoardForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget as HTMLFormElement);
  const sizeX = parseInt(formData.get("rows") as string);
  const sizeY = parseInt(formData.get("columns") as string);
  board = Board.generate([sizeX, sizeY], true);
  initializeBoard(board);
  newBoardDialog.close();
});

// Add keyboard shortcuts

// ctrl + z -> undo
document.addEventListener("keydown", async (e) => {
  if (e.ctrlKey && e.key === "z") {
    const lastMove = board.getMoveForUndo();
    console.log({ lastMove });
    if (lastMove === null) {
      console.warn("No moves to undo!");
      return;
    }
    if (lastMove.tile === null || lastMove.direction === null) return;
    await moveTile(lastMove.tile, lastMove.direction, false);
    board.undoFromHistory();
  }
});

function main() {
  initializeBoard(board);
}
main();
