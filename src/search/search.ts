import { isSquareAttacked, oppositeColor } from "../position/board";
import { generateAllMoves } from "../moves/movegen";
import type { Color, Move, Position } from "../types";
import {
  canNullMove,
  canReduce,
  getMoveScore,
  moveScoreWithKiller,
  SearchTimeoutError,
} from "./searchHelpers";
import type { SearchParameters, SearchResult, SearchState } from "./types";
import { makeLegalMove, makeNullMove } from "../moves/makeMove";
import { quiescence } from "./quiescence";
import {
  EXACT,
  LOWERBOUND,
  probeTT,
  probeTTMove,
  storeTT,
  UPPERBOUND,
} from "./tt";
import { getMoveFrom, getMoveIsCapture, getMoveTo } from "../moves/move";

export const MATE_SCORE = 1_000_000;
export const INFINITY_SCORE = 1_000_000_000;

export const searchState: SearchState = {
  deadline: 0,
  nodes: 0,
};

let killerMoves: (Move | undefined)[][] = [];
let historyHeuristic: Int32Array[][] = [];

for (let color = 0; color <= 1; color++) {
  historyHeuristic[color] = [];
  for (let from = 0; from <= 63; from++) {
    historyHeuristic[color]![from] = new Int32Array(64);
  }
}

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
    let alpha = -INFINITY_SCORE;
    const beta = INFINITY_SCORE;

    try {
      for (const move of moves) {
        const newPos = makeLegalMove(position, move);
        if (newPos == null) {
          continue;
        }

        const evaluation = evaluateMove(
          newPos,
          depth,
          alpha,
          beta,
          history,
          false,
        );

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

  const ttMove = probeTTMove(position.hash);

  // Killer moves
  if (!killerMoves[depth]) {
    killerMoves[depth] = [undefined, undefined];
  }

  let bestValue = -Infinity;
  let bestMove: Move | undefined = undefined;

  const moves = generateAllMoves(position);
  moves.sort(
    (a, b) =>
      moveScoreWithKiller(
        b,
        position,
        killerMoves[depth]!,
        getHistoryScore(position.sideToMove, b),
        ttMove,
      ) -
      moveScoreWithKiller(
        a,
        position,
        killerMoves[depth]!,
        getHistoryScore(position.sideToMove, a),
        ttMove,
      ),
  ); // MVV-LVA

  const legalMoves: Move[] = [];

  const inCheck = isSquareAttacked(
    position,
    position.kingSquares[position.sideToMove],
    oppositeColor(position.sideToMove),
  );

  for (const move of moves) {
    const newPos = makeLegalMove(position, move);

    if (newPos != null) {
      legalMoves.push(move);

      const canTryReduce =
        !inCheck && canReduce(move, depth, legalMoves.length);
      const evaluation = evaluateMove(
        newPos,
        depth,
        alpha,
        beta,
        history,
        canTryReduce,
      );

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

          const from = getMoveFrom(move);
          const to = getMoveTo(move);
          // biome-ignore lint/style/noNonNullAssertion: from/to are always 0-63, and historyHeuristic is pre-sized to [2][64] with Int32Array(64) rows
          historyHeuristic[position.sideToMove]![from]![to]! += depth * depth;
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

function getHistoryScore(color: Color, move: Move): number {
  const from = getMoveFrom(move);
  const to = getMoveTo(move);
  // biome-ignore lint/style/noNonNullAssertion: from/to are always 0-63, and historyHeuristic is pre-sized to [2][64] with Int32Array(64) rows
  return historyHeuristic[color]![from]![to]!;
}

function evaluateMove(
  newPos: Position,
  depth: number,
  alpha: number,
  beta: number,
  history: number[],
  canTryReduce: boolean,
): number {
  if (history.includes(newPos.hash)) {
    return 0;
  }

  const newHistory = [...history, newPos.hash];

  if (canTryReduce) {
    const R = 1;
    const reducedEvaluation = -search(
      newPos,
      depth - 1 - R,
      -beta,
      -alpha,
      newHistory,
      true,
    );

    if (reducedEvaluation > alpha) {
      return -search(newPos, depth - 1, -beta, -alpha, newHistory, true);
    }

    return reducedEvaluation;
  }

  return -search(newPos, depth - 1, -beta, -alpha, newHistory, true);
}
