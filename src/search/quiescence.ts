import { makeLegalMove } from "../moves/makeMove";
import { getMoveIsCapture } from "../moves/move";
import { generateAllMoves } from "../moves/movegen";
import type { Move, Position } from "../types";
import { evaluate } from "./evaluation";
import { searchState } from "./search";
import { getMoveScore, SearchTimeoutError } from "./searchHelpers";
import { EXACT, LOWERBOUND, probeTT, storeTT, UPPERBOUND } from "./tt";

export function quiescence(
  position: Position,
  alpha: number,
  beta: number,
  history: number[],
): number {
  searchState.nodes += 1;

  // Need to stop a search when time is gone
  if (searchState.nodes % 2048 === 0) {
    if (Date.now() > searchState.deadline) {
      throw new SearchTimeoutError();
    }
  }

  const standPat = evaluate(position);
  if (standPat >= beta) {
    return standPat;
  }

  const originalAlpha = alpha;

  const probeResult = probeTT(position.hash, 0, alpha, beta);
  if (probeResult != null) {
    return probeResult;
  }

  let bestValue = standPat;
  alpha = Math.max(alpha, standPat);
  let bestMove: Move | undefined = undefined;

  const moves = generateAllMoves(position);
  const captureMoves = moves.filter((move) => getMoveIsCapture(move));
  captureMoves.sort(
    (a, b) => getMoveScore(b, position) - getMoveScore(a, position),
  );

  for (const move of captureMoves) {
    const newPos = makeLegalMove(position, move);

    if (newPos != null) {
      const evaluation = -quiescence(newPos, -beta, -alpha, history);

      if (evaluation > bestValue) {
        bestValue = evaluation;
        alpha = Math.max(bestValue, alpha);
        bestMove = move;
      }
      if (alpha >= beta) {
        break;
      }
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
    storeTT(position.hash, 0, bestValue, ttFlag, bestMove);
  }

  return bestValue;
}
