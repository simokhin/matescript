import { makeLegalMove } from "../moves/makeMove";
import { getMoveIsCapture } from "../moves/move";
import { generateAllMoves } from "../moves/movegen";
import type { Move, Position } from "../types";
import { evaluate } from "./evaluation";
import { MATE_SCORE, searchState } from "./search";
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

  let standPat = evaluate(position);
  if (standPat >= beta) {
    return standPat;
  }

  let bestValue = standPat;
  alpha = Math.max(alpha, standPat);

  let moves = generateAllMoves(position);
  let captureMoves = moves.filter((move) => getMoveIsCapture(move));
  captureMoves.sort(
    (a, b) => getMoveScore(b, position) - getMoveScore(a, position),
  );

  for (let move of captureMoves) {
    let newPos = makeLegalMove(position, move);

    if (newPos != null) {
      let evaluation = -quiescence(newPos, -beta, -alpha);

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
