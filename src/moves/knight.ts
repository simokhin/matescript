import { NOT_PROMOTION } from "../constants";
import { createMove } from "./move";
import { Color, type Board, type Delta, type Move } from "../types";

export const knightDeltas: Delta[] = [
  { deltaRow: 1, deltaCol: 2 },
  { deltaRow: 1, deltaCol: -2 },
  { deltaRow: -1, deltaCol: 2 },
  { deltaRow: -1, deltaCol: -2 },
  { deltaRow: 2, deltaCol: 1 },
  { deltaRow: 2, deltaCol: -1 },
  { deltaRow: -2, deltaCol: 1 },
  { deltaRow: -2, deltaCol: -1 },
];

export function getKnightMoves(
  square: number,
  board: Board,
  color: Color,
): Move[] {
  let knightMoves: Move[] = [];

  const row = Math.floor(square / 8);
  const col = square % 8;

  for (const { deltaRow, deltaCol } of knightDeltas) {
    let newRow = row + deltaRow;
    let newCol = col + deltaCol;

    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
      let newIndex = newRow * 8 + newCol;

      if (board[newIndex] == null) {
        let move = createMove(
          square,
          newIndex,
          false,
          0,
          NOT_PROMOTION,
          false,
          false,
        );
        knightMoves.push(move);
      } else if (board[newIndex].color !== color) {
        let piece = board[newIndex].pieceType;
        let move = createMove(
          square,
          newIndex,
          true,
          piece,
          NOT_PROMOTION,
          false,
          false,
        );
        knightMoves.push(move);
      }
    }
  }

  return knightMoves;
}
