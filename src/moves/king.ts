import { isSquareAttacked, type Board, type Position } from "../board";
import { createMove } from "../move";
import {
  Color,
  NOT_PROMOTION,
  PieceType,
  type Delta,
  type Move,
} from "../types";

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

export function getCastlingMove(position: Position): Move[] {
  let castlingMoves: Move[] = [];

  if (position.sideToMove === Color.White) {
    if (position.castleRights.whiteKingside === true) {
      if (
        position.board[5] == null &&
        position.board[6] == null &&
        !isSquareAttacked(position, 4, Color.Black) &&
        !isSquareAttacked(position, 5, Color.Black) &&
        !isSquareAttacked(position, 6, Color.Black)
      ) {
        let move = createMove(4, 6, false, 0, NOT_PROMOTION, false, true);
        castlingMoves.push(move);
      }
    }

    if (position.castleRights.whiteQueenside === true) {
      if (
        position.board[3] == null &&
        position.board[2] == null &&
        position.board[1] == null &&
        !isSquareAttacked(position, 4, Color.Black) &&
        !isSquareAttacked(position, 3, Color.Black) &&
        !isSquareAttacked(position, 2, Color.Black)
      ) {
        let move = createMove(4, 2, false, 0, NOT_PROMOTION, false, true);
        castlingMoves.push(move);
      }
    }
  } else if (position.sideToMove === Color.Black) {
    if (position.castleRights.blackKingside === true) {
      if (
        position.board[61] == null &&
        position.board[62] == null &&
        !isSquareAttacked(position, 60, Color.White) &&
        !isSquareAttacked(position, 61, Color.White) &&
        !isSquareAttacked(position, 62, Color.White)
      ) {
        let move = createMove(60, 62, false, 0, NOT_PROMOTION, false, true);
        castlingMoves.push(move);
      }
    }

    if (position.castleRights.blackQueenside === true) {
      if (
        position.board[59] == null &&
        position.board[58] == null &&
        position.board[57] == null &&
        !isSquareAttacked(position, 60, Color.White) &&
        !isSquareAttacked(position, 59, Color.White) &&
        !isSquareAttacked(position, 58, Color.White)
      ) {
        let move = createMove(60, 58, false, 0, NOT_PROMOTION, false, true);
        castlingMoves.push(move);
      }
    }
  }

  return castlingMoves;
}
