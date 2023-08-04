import { Board, Direction, Move } from "./Board";

export type BFSNode = {
  board: Board;
  previous: BFSNode | null;
  move: Move | null;
};

export class BFS {
  public static solve(initialState: Board, goalState: Board) {
    const queue: BFSNode[] = [
      { board: initialState, previous: null, move: null },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentState = queue.shift() as BFSNode;
      visited.add(BFS.hash(currentState.board));
      const newStates = BFS.resolveNewStates(currentState, visited);
      queue.push(...newStates);

      if (BFS.isSolved(currentState.board, goalState)) {
        const solution: Move[] = [];
        let currentNode: BFSNode | null = currentState;
        while (currentNode !== null) {
          solution.push(currentNode.move!);
          currentNode = currentNode.previous;
        }
        return solution.reverse().slice(1);
      }
    }
    return null;
  }

  private static resolveNewStates(
    currentState: BFSNode,
    visited: Set<string>
  ): BFSNode[] {
    const newStates: BFSNode[] = [];
    const [emptyX, emptyY] = currentState.board.emptyTile;
    if (emptyX > 0) {
      const newState: BFSNode = {
        board: Board.cloneBoard(currentState.board),
        previous: currentState,
        move: {
          direction: Direction.Down,
          tile: [emptyX - 1, emptyY],
        },
      };
      newState.board.moveTile([emptyX - 1, emptyY], Direction.Down, false);
      newStates.push(newState);
    }
    if (emptyX < currentState.board.size[0] - 1) {
      const newState: BFSNode = {
        board: Board.cloneBoard(currentState.board),
        previous: currentState,
        move: {
          direction: Direction.Up,
          tile: [emptyX + 1, emptyY],
        },
      };
      newState.board.moveTile([emptyX + 1, emptyY], Direction.Up, false);
      newStates.push(newState);
    }
    if (emptyY > 0) {
      const newState: BFSNode = {
        board: Board.cloneBoard(currentState.board),
        previous: currentState,
        move: {
          direction: Direction.Right,
          tile: [emptyX, emptyY - 1],
        },
      };
      newState.board.moveTile([emptyX, emptyY - 1], Direction.Right, false);
      newStates.push(newState);
    }
    if (emptyY < currentState.board.size[1] - 1) {
      const newState: BFSNode = {
        board: Board.cloneBoard(currentState.board),
        previous: currentState,
        move: {
          direction: Direction.Left,
          tile: [emptyX, emptyY + 1],
        },
      };
      newState.board.moveTile([emptyX, emptyY + 1], Direction.Left, false);
      newStates.push(newState);
    }
    return newStates.filter((state) => {
      const stateHashString = BFS.hash(state.board);
      if (visited.has(stateHashString)) return false;
      return true;
    });
  }

  private static isSolved(currentState: Board, goalState: Board) {
    return BFS.hash(currentState) === BFS.hash(goalState);
  }

  private static hash(board: Board) {
    return JSON.stringify(board.tiles);
  }
}
