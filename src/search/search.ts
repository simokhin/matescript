import { isSquareAttacked, oppositeColor } from "../position/board";
import { generateAllMoves } from "../moves/movegen";
import type { Move, Position } from "../types";
import {
  canNullMove,
  getMoveScore,
  moveScoreWithKiller,
  SearchTimeoutError,
} from "./searchHelpers";
import type { SearchParameters, SearchResult, SearchState } from "./types";
import { makeLegalMove, makeNullMove } from "../moves/makeMove";
import { quiescence } from "./quiescence";
import { EXACT, LOWERBOUND, probeTT, storeTT, UPPERBOUND } from "./tt";
import { getMoveIsCapture } from "../moves/move";

export const MATE_SCORE = 1_000_000;

export const searchState: SearchState = {
  deadline: 0,
  nodes: 0,
};

let killerMoves: (Move | undefined)[][] = [];

export function findBestMove(
  position: Position,
  params: SearchParameters,
  history: number[],
): SearchResult {
  let bestMove: Move | undefined;
  let bestScore: number | undefined;

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

        let evaluation: number;

        const repeat = history.includes(newPos.hash);
        if (repeat) {
          evaluation = 0;
        } else {
          evaluation = -search(
            newPos,
            depth - 1,
            -beta,
            -alpha,
            [...history, newPos.hash],
            true,
          );
        }

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
          // biome-ignore lint/style/noNonNullAssertion: bestMove and bestScore are always committed together, and callers only read score after checking bestMove !== undefined
          score: bestScore!,
        };
      } else {
        throw e;
      }
    }

    bestMove = currentBestMove;
    bestScore = alpha;

    depth += 1;
  }

  return {
    bestMove: bestMove,
    nodes: searchState.nodes,
    depth: depth - 1,
    // biome-ignore lint/style/noNonNullAssertion: bestMove and bestScore are always committed together, and callers only read score after checking bestMove !== undefined
    score: bestScore!,
  };
}

export function search(
  position: Position,
  depth: number,
  alpha: number,
  beta: number,
  history: number[],
  allowNullMove: boolean,
) {
  searchState.nodes += 1;

  // Need to stop a search when time is gone
  if (searchState.nodes % 2048 === 0) {
    if (Date.now() > searchState.deadline) {
      throw new SearchTimeoutError();
    }
  }

  if (depth === 0) {
    return quiescence(position, alpha, beta, history);
  }

  const originalAlpha = alpha;

  const probeResult = probeTT(position.hash, depth, alpha, beta);
  if (probeResult != null) {
    return probeResult;
  }

  // Null-move pruning
  if (allowNullMove && canNullMove(position, depth)) {
    const R = 2;
    const nullPos = makeNullMove(position);
    const nullMoveScore = -search(
      nullPos,
      depth - 1 - R,
      -beta,
      -beta + 1,
      history,
      false,
    );

    if (nullMoveScore >= beta) {
      return beta;
    }
  }

  // Killer moves
  if (!killerMoves[depth]) {
    killerMoves[depth] = [undefined, undefined];
  }

  let bestValue = -Infinity;
  let bestMove: Move | undefined = undefined;

  const moves = generateAllMoves(position);
  moves.sort(
    (a, b) =>
      moveScoreWithKiller(b, position, killerMoves[depth]!) -
      moveScoreWithKiller(a, position, killerMoves[depth]!),
  ); // MVV-LVA

  const legalMoves: Move[] = [];

  for (const move of moves) {
    const newPos = makeLegalMove(position, move);

    if (newPos != null) {
      legalMoves.push(move);

      let evaluation: number;

      const repeat = history.includes(newPos.hash);
      if (repeat) {
        evaluation = 0;
      } else {
        evaluation = -search(
          newPos,
          depth - 1,
          -beta,
          -alpha,
          [...history, newPos.hash],
          true,
        );
      }

      if (evaluation > bestValue) {
        bestValue = evaluation;
        alpha = Math.max(bestValue, alpha);
        bestMove = move;
      }
      if (alpha >= beta) {
        if (!getMoveIsCapture(move)) {
          if (
            killerMoves[depth][0] === move ||
            killerMoves[depth][1] === move
          ) {
            break;
          } else {
            killerMoves[depth][1] = killerMoves[depth][0];
            killerMoves[depth][0] = move;
          }
        }
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

  let ttFlag: number;
  if (bestValue <= originalAlpha) {
    ttFlag = UPPERBOUND;
  } else if (bestValue >= beta) {
    ttFlag = LOWERBOUND;
  } else {
    ttFlag = EXACT;
  }

  if (bestMove !== undefined) {
    storeTT(position.hash, depth, bestValue, ttFlag, bestMove);
  }

  return bestValue;
}
