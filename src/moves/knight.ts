import { NOT_PROMOTION } from "../constants";
import { createMove } from "./move";
import type { Color, Board, Delta, Move } from "../types";

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
  const knightMoves: Move[] = [];

  const row = Math.floor(square / 8);
  const col = square % 8;

  for (const { deltaRow, deltaCol } of knightDeltas) {
    const newRow = row + deltaRow;
    const newCol = col + deltaCol;

    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
      const newIndex = newRow * 8 + newCol;

      if (board[newIndex] == null) {
        const move = createMove(
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
        const piece = board[newIndex].pieceType;
        const move = createMove(
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
