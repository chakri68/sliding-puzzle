export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export type Move = {
  tile: TileIndex;
  direction: Direction;
};

export type TileIndex = [number, number];

export interface BoardType {
  tiles: (number | null)[][];
  emptyTile: TileIndex;
  size: TileIndex;
  moveTile: (tile: TileIndex, direction: Direction) => TileIndex;
  isSolved: () => boolean;
  getAllowedMove: (tile: TileIndex) => Direction | null;
}

export class Board implements BoardType {
  public size: TileIndex;
  public emptyTile: TileIndex;
  public history: Move[] = [];
  constructor(
    public tiles: (number | null)[][],
    public moveCallback: (move: Move) => Promise<any> = async () => {}
  ) {
    this.size = [tiles.length, tiles[0].length];
    let nullTile: TileIndex | null = null;
    for (let i = 0; i < this.size[0]; ++i)
      for (let j = 0; j < this.size[1]; ++j) {
        if (tiles[i][j] === null) {
          nullTile = [i, j];
          break;
        }
      }
    if (nullTile === null) throw new Error("Invalid board");
    else this.emptyTile = nullTile;
  }

  moveTile(tile: TileIndex, direction: Direction, saveToHistory = true) {
    const [x, y] = tile;
    const [sizeX, sizeY] = this.size;
    let newTileIdx: TileIndex;
    switch (direction) {
      case Direction.Up:
        if (x === 0 || this.tiles[x - 1][y] !== null) return tile;
        newTileIdx = [x - 1, y];
        break;
      case Direction.Down:
        if (x === sizeX - 1 || this.tiles[x + 1][y] !== null) return tile;
        newTileIdx = [x + 1, y];
        break;
      case Direction.Left:
        if (y === 0 || this.tiles[x][y - 1] !== null) return tile;
        newTileIdx = [x, y - 1];
        break;
      case Direction.Right:
        if (y === sizeY - 1 || this.tiles[x][y + 1] !== null) return tile;
        newTileIdx = [x, y + 1];
        break;
    }
    if (saveToHistory) this.history.push({ tile, direction });
    this.tiles[newTileIdx[0]][newTileIdx[1]] = this.tiles[x][y];
    this.tiles[x][y] = null;
    this.emptyTile = [x, y];
    return newTileIdx;
  }

  isSolved() {
    const [sizeX, sizeY] = this.size;
    for (let i = 0; i < sizeX; i++)
      for (let j = 0; j < sizeY; j++)
        if (
          !(i === sizeX - 1 && j === sizeY - 1) &&
          this.tiles[i][j] !== i * sizeY + j + 1
        )
          return false;
    return true;
  }

  getAllowedMove(tile: TileIndex) {
    const [x, y] = tile;
    const [eX, eY] = this.emptyTile;
    const [sizeX, sizeY] = this.size;
    if (x > 0 && x - 1 === eX && y === eY) return Direction.Up;
    if (x < sizeX - 1 && x + 1 === eX && y === eY) return Direction.Down;
    if (y > 0 && x === eX && y - 1 === eY) return Direction.Left;
    if (y < sizeY - 1 && x === eX && y + 1 === eY) return Direction.Right;
    return null;
  }

  static generate(size: TileIndex, shuffle: boolean = false) {
    const [sizeX, sizeY] = size;
    const tiles: (number | null)[][] = [];
    for (let i = 0; i < sizeX; i++) {
      tiles.push([]);
      for (let j = 0; j < sizeY; j++) {
        tiles[i].push(i * sizeY + j + 1);
      }
    }
    tiles[sizeX - 1][sizeY - 1] = null;

    if (shuffle) {
      // Shuffle the tiles if shuffle is true
      for (let i = tiles.length - 1; i > 0; i--) {
        for (let j = tiles[i].length - 1; j > 0; j--) {
          const randX = Math.floor(Math.random() * (i + 1));
          const randY = Math.floor(Math.random() * (j + 1));

          const temp = tiles[i][j];
          tiles[i][j] = tiles[randX][randY];
          tiles[randX][randY] = temp;
        }
      }
    }

    return new Board(tiles);
  }

  static getMovesForShuffle(board: Board, times: number): Move[] {
    const shuffledBoard = Board.cloneBoard(board);
    const [sizeX, sizeY] = shuffledBoard.size;
    const moves: Move[] = [];

    for (let i = 0; i < times; i++) {
      const [eX, eY] = shuffledBoard.emptyTile;
      const validMoves: number[] = [];

      // Check and store valid moves
      if (
        eX > 0 &&
        moves[moves.length - 1]?.direction !==
          getOppositeDirection(Direction.Down)
      ) {
        validMoves.push(Direction.Up);
      }
      if (
        eX < sizeX - 1 &&
        moves[moves.length - 1]?.direction !==
          getOppositeDirection(Direction.Up)
      ) {
        validMoves.push(Direction.Down);
      }
      if (
        eY > 0 &&
        moves[moves.length - 1]?.direction !==
          getOppositeDirection(Direction.Right)
      ) {
        validMoves.push(Direction.Left);
      }
      if (
        eY < sizeY - 1 &&
        moves[moves.length - 1]?.direction !==
          getOppositeDirection(Direction.Left)
      ) {
        validMoves.push(Direction.Right);
      }

      // Shuffle the valid moves using Fisher-Yates algorithm
      for (let j = validMoves.length - 1; j > 0; j--) {
        const randomIndex = Math.floor(Math.random() * (j + 1));
        [validMoves[j], validMoves[randomIndex]] = [
          validMoves[randomIndex],
          validMoves[j],
        ];
      }

      const direction = validMoves[0]; // Pick the first move from shuffled valid moves

      switch (direction) {
        case Direction.Up:
          shuffledBoard.moveTile([eX - 1, eY], Direction.Down, false);
          moves.push({ tile: [eX - 1, eY], direction: Direction.Down });
          break;
        case Direction.Down:
          shuffledBoard.moveTile([eX + 1, eY], Direction.Up, false);
          moves.push({ tile: [eX + 1, eY], direction: Direction.Up });
          break;
        case Direction.Left:
          shuffledBoard.moveTile([eX, eY - 1], Direction.Right, false);
          moves.push({ tile: [eX, eY - 1], direction: Direction.Right });
          break;
        case Direction.Right:
          shuffledBoard.moveTile([eX, eY + 1], Direction.Left, false);
          moves.push({ tile: [eX, eY + 1], direction: Direction.Left });
          break;
      }
    }

    return moves;
  }

  public resetHistory() {
    this.history = [];
  }

  public getChronologicalHistory() {
    const reverseHistory = [];
    for (let i = this.history.length - 1; i >= 0; i--) {
      reverseHistory.push(getOppositeMove(this.history[i]));
    }
    return reverseHistory;
  }

  public getMoveForUndo() {
    if (this.history.length === 0) return null;
    const move = this.history[this.history.length - 1];
    console.log({ move });
    return getOppositeMove(move);
  }

  public undoFromHistory() {
    this.history.pop();
  }

  public findTile(tileValue: number | null): TileIndex {
    for (let i = 0; i < this.size[0]; i++) {
      for (let j = 0; j < this.size[1]; j++) {
        if (this.tiles[i][j] === tileValue) {
          return [i, j];
        }
      }
    }
    throw new Error(`Tile ${tileValue} not found on the board.`);
  }

  public static cloneBoard(board: Board) {
    const newTiles = board.tiles.map((row) => row.map((tile) => tile));
    return new Board(newTiles);
  }
}

export function getOppositeMove(move: Move) {
  const direction = move.direction;
  let newDirection: Direction = Direction.Up;
  let [newX, newY] = move.tile;
  switch (direction) {
    case Direction.Up:
      newDirection = Direction.Down;
      newX -= 1;
      break;
    case Direction.Down:
      newDirection = Direction.Up;
      newX += 1;
      break;
    case Direction.Left:
      newDirection = Direction.Right;
      newY -= 1;
      break;
    case Direction.Right:
      newDirection = Direction.Left;
      newY += 1;
      break;
  }
  return {
    tile: [newX, newY] as TileIndex,
    direction: newDirection,
  };
}

export function getOppositeDirection(dir: Direction) {
  switch (dir) {
    case Direction.Up:
      return Direction.Down;
    case Direction.Down:
      return Direction.Up;
    case Direction.Left:
      return Direction.Right;
    case Direction.Right:
      return Direction.Left;
  }
}
