import { isSquareAttacked, oppositeColor } from "../position/board";
import { generateAllMoves } from "../moves/movegen";
import type { Move, Position } from "../types";
import { getMoveScore, SearchTimeoutError } from "./searchHelpers";
import type { SearchParameters, SearchResult, SearchState } from "./types";
import { makeLegalMove } from "../moves/makeMove";
import { quiescence } from "./quiescence";

export const MATE_SCORE = 1_000_000;

export const searchState: SearchState = {
  deadline: 0,
  nodes: 0,
};

export function findBestMove(
  position: Position,
  params: SearchParameters,
): SearchResult {
  let bestMove: Move | undefined;

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
    const moves = generateAllMoves(position);
    moves.sort((a, b) => getMoveScore(b, position) - getMoveScore(a, position)); // MVV-LVA

    let currentBestMove: Move | undefined = bestMove;
    let alpha = -Infinity;
    const beta = Infinity;

    try {
      for (const move of moves) {
        const newPos = makeLegalMove(position, move);
        if (newPos == null) {
          continue;
        }

        const evaluation = -search(newPos, depth - 1, -beta, -alpha);

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

  // Need to stop a search when time is gone
  if (searchState.nodes % 2048 === 0) {
    if (Date.now() > searchState.deadline) {
      throw new SearchTimeoutError();
    }
  }

  if (depth === 0) {
    return quiescence(position, alpha, beta);
  }

  let bestValue = -Infinity;

  const moves = generateAllMoves(position);
  moves.sort((a, b) => getMoveScore(b, position) - getMoveScore(a, position)); // MVV-LVA

  const legalMoves: Move[] = [];

  for (const move of moves) {
    const newPos = makeLegalMove(position, move);

    if (newPos != null) {
      legalMoves.push(move);
      const evaluation = -search(newPos, depth - 1, -beta, -alpha);

      if (evaluation > bestValue) {
        bestValue = evaluation;
        alpha = Math.max(bestValue, alpha);
      }
      if (alpha >= beta) {
        break;
      }
    }
  }

  // Check for a mate/stalemate
  if (legalMoves.length === 0) {
    if (
      isSquareAttacked(
        position,
        position.kingSquares[position.sideToMove],
        oppositeColor(position.sideToMove),
      )
    ) {
      return -(MATE_SCORE + depth);
    } else {
      return 0;
    }
  }

  return bestValue;
}
