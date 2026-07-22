import { isSquareAttacked, type Position } from "./board";
import { makeMove } from "./move";
import { generateAllMoves } from "./movegen";
import { Color } from "./types";

export function perft(position: Position, depth: number): number {
  let nodes = 0;

  if (depth === 0) {
    return 1;
  }

  let moves = generateAllMoves(position);

  moves.forEach((m) => {
    let newPos = makeMove(position, m);
    if (position.sideToMove === Color.White) {
      if (!isSquareAttacked(newPos, newPos.kingSquares.white, Color.Black)) {
        nodes += perft(newPos, depth - 1);
      }
    } else if (position.sideToMove === Color.Black) {
      if (!isSquareAttacked(newPos, newPos.kingSquares.black, Color.White)) {
        nodes += perft(newPos, depth - 1);
      }
    }
  });

  return nodes;
}
