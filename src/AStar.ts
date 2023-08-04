import {
  Board,
  Direction,
  Move,
  TileIndex,
  getOppositeDirection,
} from "./Board";
import PriorityQueue from "./structs/PriorityQueue";

export interface HeuristicFunction {
  (board: Board, goalState: Board): number;
}

export interface AStarNode {
  board: Board;
  previous: AStarNode | null;
  move: Move | null;
  gScore: number;
  fScore: number;
}

export class AStar {
  public static solve(
    initialState: Board,
    goalState: Board,
    heuristic: HeuristicFunction = AStar.misplacedTiles
  ) {
    const openStates: PriorityQueue<AStarNode> = new PriorityQueue(
      (a, b) => a.fScore < b.fScore
    );
    openStates.push({
      board: initialState,
      previous: null,
      move: null,
      gScore: 0,
      fScore: AStar.misplacedTiles(initialState, goalState),
    });
    const visitedStates = new Set<string>();
    visitedStates.add(AStar.hash(initialState));

    while (!openStates.isEmpty()) {
      const currentNode = openStates.pop() as AStarNode;

      if (AStar.isSolved(currentNode.board, goalState)) {
        const solution: Move[] = [];
        let node: AStarNode | null = currentNode;
        while (node !== null) {
          if (node.move !== null) {
            solution.push(node.move);
          }
          node = node.previous;
        }
        return solution.reverse();
      }

      const newStates = AStar.resolveNewStates(
        currentNode,
        goalState,
        heuristic
      );
      for (const newState of newStates) {
        if (visitedStates.has(AStar.hash(newState.board))) continue;

        // const existingNode = openSet.find(
        //   (node) => AStar.hash(node.board) === AStar.hash(newState.board)
        // );
        // if (existingNode && newState.gScore >= existingNode.gScore) continue;

        // if (!existingNode) openSet.push(newState);

        openStates.push(newState);
        visitedStates.add(AStar.hash(newState.board));
      }
    }

    return null;
  }

  private static resolveNewStates(
    currentNode: AStarNode,
    goalState: Board,
    heuristic: HeuristicFunction
  ): AStarNode[] {
    const newStates: AStarNode[] = [];
    const [emptyX, emptyY] = currentNode.board.emptyTile;
    const directions = [
      Direction.Up,
      Direction.Down,
      Direction.Left,
      Direction.Right,
    ];

    for (const direction of directions) {
      const [newX, newY] = AStar.getNewPosition(emptyX, emptyY, direction);

      if (
        newX >= 0 &&
        newX < currentNode.board.size[0] &&
        newY >= 0 &&
        newY < currentNode.board.size[1]
      ) {
        const newBoard = Board.cloneBoard(currentNode.board);
        const newTile: TileIndex = [newX, newY];

        if (newBoard.getAllowedMove(newTile) !== null) {
          const dir = getOppositeDirection(direction);
          newBoard.moveTile(newTile, dir, false);
          const gScore = currentNode.gScore + 1;
          const hScore = heuristic(newBoard, goalState);
          const fScore = gScore + hScore;

          newStates.push({
            board: newBoard,
            previous: currentNode,
            move: { tile: newTile, direction: dir },
            gScore: gScore,
            fScore: fScore,
          });
        }
      }
    }

    return newStates;
  }

  private static getNewPosition(
    x: number,
    y: number,
    direction: Direction
  ): TileIndex {
    switch (direction) {
      case Direction.Up:
        return [x - 1, y];
      case Direction.Down:
        return [x + 1, y];
      case Direction.Left:
        return [x, y - 1];
      case Direction.Right:
        return [x, y + 1];
      default:
        return [x, y];
    }
  }

  private static isSolved(currentState: Board, goalState: Board) {
    return AStar.hash(currentState) === AStar.hash(goalState);
  }

  private static cloneBoard(board: Board) {
    const newTiles = board.tiles.map((row) => row.map((tile) => tile));
    return new Board(newTiles);
  }

  private static hash(board: Board) {
    return JSON.stringify(board.tiles);
  }

  private static manhattanDistance(board: Board, goalState: Board): number {
    let distance = 0;
    for (let x = 0; x < board.size[0]; x++) {
      for (let y = 0; y < board.size[1]; y++) {
        const tile = board.tiles[x][y];
        if (tile !== null) {
          const [goalX, goalY] = goalState.findTile(tile);
          distance += Math.abs(x - goalX) + Math.abs(y - goalY);
        }
      }
    }
    return distance;
  }

  private static misplacedTiles(board: Board, goalState: Board): number {
    let cost = 0;
    const [sizeX, sizeY] = board.size;
    for (let x = 0; x < sizeX; x++)
      for (let y = 0; y < sizeY; y++) {
        const tile = board.tiles[x][y];
        if (tile !== null) {
          const [goalX, goalY] = goalState.findTile(tile);
          if (x !== goalX || y !== goalY) cost++;
        }
      }
    return cost;
  }
}
