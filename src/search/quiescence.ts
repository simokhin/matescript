import { makeLegalMove } from "../moves/makeMove";
import { getMoveIsCapture } from "../moves/move";
import { generateAllMoves } from "../moves/movegen";
import type { Position } from "../types";
import { evaluate } from "./evaluation";
import { searchState } from "./search";
import { getMoveScore, SearchTimeoutError } from "./searchHelpers";

export function quiescence(
  position: Position,
  alpha: number,
  beta: number,
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

  let bestValue = standPat;
  alpha = Math.max(alpha, standPat);

  const moves = generateAllMoves(position);
  const captureMoves = moves.filter((move) => getMoveIsCapture(move));
  captureMoves.sort(
    (a, b) => getMoveScore(b, position) - getMoveScore(a, position),
  );

  for (const move of captureMoves) {
    const newPos = makeLegalMove(position, move);

    if (newPos != null) {
      const evaluation = -quiescence(newPos, -beta, -alpha);

      if (evaluation > bestValue) {
        bestValue = evaluation;
        alpha = Math.max(bestValue, alpha);
      }
      if (alpha >= beta) {
        break;
      }
    }
  }

  return bestValue;
}
