import type { Board } from "../board";
import { createMove } from "../move";
import { NOT_PROMOTION, type Color, type Delta, type Move } from "../types";

export const kingDeltas: Delta[] = [
  { deltaRow: 1, deltaCol: 0 },
  { deltaRow: -1, deltaCol: 0 },
  { deltaRow: 0, deltaCol: 1 },
  { deltaRow: 0, deltaCol: -1 },
  { deltaRow: 1, deltaCol: 1 },
  { deltaRow: 1, deltaCol: -1 },
  { deltaRow: -1, deltaCol: 1 },
  { deltaRow: -1, deltaCol: -1 },
];

export function getKingMoves(
  square: number,
  board: Board,
  color: Color,
): Move[] {
  let kingMoves: Move[] = [];

  const row = Math.floor(square / 8);
  const col = square % 8;

  for (const { deltaRow, deltaCol } of kingDeltas) {
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
        kingMoves.push(move);
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
        kingMoves.push(move);
      }
    }
  }

  return kingMoves;
}
