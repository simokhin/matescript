import { isSquareAttacked, oppositeColor, type Position } from "./board";
import { evaluate } from "./evaluation";
import { makeLegalMove } from "./move";
import { generateAllMoves } from "./movegen";
import type { Move } from "./types";

type SearchState = {
  deadline: number;
  nodes: number;
};

type MaxDepth = { name: "maxDepth"; depth: number };
type TimeLimitMs = { name: "timeLimit"; limit: number };
export type SearchParameters = MaxDepth | TimeLimitMs;

let searchState: SearchState = {
  deadline: 0,
  nodes: 0,
};

export function findBestMove(
  position: Position,
  params: SearchParameters,
): Move | undefined {
  let bestMove: Move | undefined = undefined;

  searchState.deadline = 0;
  searchState.nodes = 0;

  let maxDepth = 0;

  // Check if we will search by depth or by time
  switch (params.name) {
    case "maxDepth":
      searchState.deadline = Infinity;
      maxDepth = params.depth;
      break;
    case "timeLimit":
      searchState.deadline = Date.now() + params.limit;
      maxDepth = Infinity;
      break;
  }

  // Iterative Deepening
  let depth = 1;
  while (depth <= maxDepth && Date.now() <= searchState.deadline) {
    let moves = generateAllMoves(position);

    let currentBestMove: Move | undefined = bestMove;
    let bestScore = -Infinity;

    try {
      for (let move of moves) {
        let newPos = makeLegalMove(position, move);
        if (newPos == null) {
          continue;
        }

        let evaluation = -search(newPos, depth - 1);

        if (evaluation > bestScore) {
          bestScore = evaluation;
          currentBestMove = move;
        }
      }
    } catch (e) {
      if (e instanceof SearchTimeoutError) {
        return bestMove;
      } else {
        throw e;
      }
    }

    bestMove = currentBestMove;

    depth += 1;
  }

  return bestMove;
}

export function search(position: Position, depth: number) {
  searchState.nodes += 1;

  if (searchState.nodes % 2048 === 0) {
    if (Date.now() > searchState.deadline) {
      throw new SearchTimeoutError();
    }
  }

  if (depth === 0) {
    return evaluate(position);
  }

  let bestValue = -Infinity;

  let moves = generateAllMoves(position);

  for (let move of moves) {
    let newPos = makeLegalMove(position, move);
    if (newPos != null) {
      let evaluation = -search(newPos, depth - 1);

      if (evaluation > bestValue) {
        bestValue = evaluation;
      }
    }
  }

  if (bestValue === -Infinity) {
    if (
      isSquareAttacked(
        position,
        position.kingSquares[position.sideToMove],
        oppositeColor(position.sideToMove),
      )
    ) {
      return -Infinity;
    } else {
      return 0;
    }
  }

  return bestValue;
}

class SearchTimeoutError extends Error {}
