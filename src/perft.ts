import { isSquareAttacked } from "./position/board";
import { generateAllMoves } from "./moves/movegen";
import { Color, type Position } from "./types";
import { makeMove } from "./moves/makeMove";

export function perft(position: Position, depth: number): number {
  let nodes = 0;

  if (depth === 0) {
    return 1;
  }

  let moves = generateAllMoves(position);

  moves.forEach((m) => {
    let newPos = makeMove(position, m);
    if (position.sideToMove === Color.White) {
      if (
        !isSquareAttacked(newPos, newPos.kingSquares[Color.White], Color.Black)
      ) {
        nodes += perft(newPos, depth - 1);
      }
    } else if (position.sideToMove === Color.Black) {
      if (
        !isSquareAttacked(newPos, newPos.kingSquares[Color.Black], Color.White)
      ) {
        nodes += perft(newPos, depth - 1);
      }
    }
  });

  return nodes;
}
