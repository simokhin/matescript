import { isSquareAttacked, oppositeColor, type Position } from "./board";
import { evaluate } from "./evaluation";
import { makeLegalMove, makeMove } from "./move";
import { generateAllMoves } from "./movegen";
import { Color } from "./types";

export function search(position: Position, depth: number) {
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
