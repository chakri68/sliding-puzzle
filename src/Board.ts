export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

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
  constructor(
    public tiles: (number | null)[][],
    public emptyTile: TileIndex,
    public size: TileIndex = [tiles.length, tiles[0].length]
  ) {}

  moveTile(tile: TileIndex, direction: Direction): TileIndex {
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
}
