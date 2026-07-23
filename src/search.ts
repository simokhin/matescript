import { isSquareAttacked, oppositeColor, type Position } from "./board";
import { evaluate, pieceWeights } from "./evaluation";
import {
  getMoveCapturePiece,
  getMoveFrom,
  getMoveIsCapture,
  makeLegalMove,
} from "./move";
import { generateAllMoves } from "./movegen";
import type { Move, Piece, PieceType } from "./types";

type SearchState = {
  deadline: number;
  nodes: number;
};

type MaxDepth = { name: "maxDepth"; depth: number };
type TimeLimitMs = { name: "timeLimit"; limit: number };
export type SearchParameters = MaxDepth | TimeLimitMs;

type SearchResult = {
  bestMove: Move | undefined;
  nodes: number;
  depth: number;
};

let searchState: SearchState = {
  deadline: 0,
  nodes: 0,
};

export function findBestMove(
  position: Position,
  params: SearchParameters,
): SearchResult {
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
    moves.sort((a, b) => getMoveScore(b, position) - getMoveScore(a, position)); // MVV-LVA

    let currentBestMove: Move | undefined = bestMove;
    let alpha = -Infinity;
    let beta = Infinity;

    try {
      for (let move of moves) {
        let newPos = makeLegalMove(position, move);
        if (newPos == null) {
          continue;
        }

        let evaluation = -search(newPos, depth - 1, -beta, -alpha);

        if (evaluation > alpha) {
          alpha = evaluation;
          currentBestMove = move;
        }
      }
    } catch (e) {
      if (e instanceof SearchTimeoutError) {
        return {
          bestMove: bestMove,
          nodes: searchState.nodes,
          depth: depth - 1,
        };
      } else {
        throw e;
      }
    }

    bestMove = currentBestMove;

    depth += 1;
  }

  return {
    bestMove: bestMove,
    nodes: searchState.nodes,
    depth: depth - 1,
  };
}

export function search(
  position: Position,
  depth: number,
  alpha: number,
  beta: number,
) {
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
  moves.sort((a, b) => getMoveScore(b, position) - getMoveScore(a, position)); // MVV-LVA

  for (let move of moves) {
    let newPos = makeLegalMove(position, move);
    if (newPos != null) {
      let evaluation = -search(newPos, depth - 1, -beta, -alpha);

      if (evaluation > bestValue) {
        bestValue = evaluation;
        alpha = Math.max(bestValue, alpha);
      }
      if (alpha >= beta) {
        break;
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

function getMoveScore(move: Move, position: Position): number {
  let score = 0;

  if (getMoveIsCapture(move)) {
    let attacker: PieceType = position.board[getMoveFrom(move)]!.pieceType;
    let victim: PieceType = getMoveCapturePiece(move);

    score = pieceWeights[victim] * 10 - pieceWeights[attacker];
  }

  return score;
}
