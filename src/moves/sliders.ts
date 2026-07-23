import { NOT_PROMOTION } from "../constants";
import { createMove } from "./move";
import { Color, type Delta, type Move, type Square } from "../types";

export const rookDeltas: Delta[] = [
  { deltaRow: 1, deltaCol: 0 },
  { deltaRow: -1, deltaCol: 0 },
  { deltaRow: 0, deltaCol: 1 },
  { deltaRow: 0, deltaCol: -1 },
];

export const bishopDeltas: Delta[] = [
  { deltaRow: 1, deltaCol: 1 },
  { deltaRow: 1, deltaCol: -1 },
  { deltaRow: -1, deltaCol: 1 },
  { deltaRow: -1, deltaCol: -1 },
];

export function getRookMoves(
  square: number,
  board: Square[],
  color: Color,
): Move[] {
  return getSliderMoves(square, board, color, rookDeltas);
}

export function getBishopMoves(
  square: number,
  board: Square[],
  color: Color,
): Move[] {
  return getSliderMoves(square, board, color, bishopDeltas);
}

export function getQueenMoves(
  square: number,
  board: Square[],
  color: Color,
): Move[] {
  return getSliderMoves(square, board, color, [...rookDeltas, ...bishopDeltas]);
}

function getSliderMoves(
  square: number,
  board: Square[],
  color: Color,
  delta: Delta[],
): Move[] {
  let moves: Move[] = [];

  const row = Math.floor(square / 8);
  const col = square % 8;

  for (const { deltaRow, deltaCol } of delta) {
    let step = 1;
    while (true) {
      let newRow = row + deltaRow * step;
      let newCol = col + deltaCol * step;

      if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
        let newIndex = newRow * 8 + newCol;
        if (board[newIndex] != null) {
          if (board[newIndex].color === color) {
            break;
          } else {
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
            moves.push(move);
            break;
          }
        } else {
          let move = createMove(
            square,
            newIndex,
            false,
            0,
            NOT_PROMOTION,
            false,
            false,
          );
          moves.push(move);
        }
      } else {
        break;
      }

      step++;
    }
  }

  return moves;
}
