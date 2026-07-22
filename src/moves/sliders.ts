import { Color, type Delta, type Square } from "../types";

const rookDeltas: Delta[] = [
  { deltaRow: 1, deltaCol: 0 },
  { deltaRow: -1, deltaCol: 0 },
  { deltaRow: 0, deltaCol: 1 },
  { deltaRow: 0, deltaCol: -1 },
];

const bishopDeltas: Delta[] = [
  { deltaRow: 1, deltaCol: 1 },
  { deltaRow: 1, deltaCol: -1 },
  { deltaRow: -1, deltaCol: 1 },
  { deltaRow: -1, deltaCol: -1 },
];

export function getRookMoves(
  square: number,
  board: Square[],
  color: Color,
): number[] {
  return getSliderMoves(square, board, color, rookDeltas);
}

export function getBishopMoves(
  square: number,
  board: Square[],
  color: Color,
): number[] {
  return getSliderMoves(square, board, color, bishopDeltas);
}

export function getQueenMoves(
  square: number,
  board: Square[],
  color: Color,
): number[] {
  return getSliderMoves(square, board, color, [...rookDeltas, ...bishopDeltas]);
}

function getSliderMoves(
  square: number,
  board: Square[],
  color: Color,
  delta: Delta[],
): number[] {
  let moves: number[] = [];

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
            moves.push(newIndex);
            break;
          }
        } else {
          moves.push(newIndex);
        }
      } else {
        break;
      }

      step++;
    }
  }

  return moves;
}
