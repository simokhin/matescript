import { getCastlingMove, getKingMoves } from "./king";
import { getKnightMoves } from "./knight";
import { getPawnMoves } from "./pawn";
import { getBishopMoves, getQueenMoves, getRookMoves } from "./sliders";
import { PieceType, type Move, type Position } from "../types";

export function generateAllMoves(position: Position): Move[] {
  let moves: Move[] = [];

  for (let i = 0; i < 64; i++) {
    let piece = position.board[i];
    if (piece == null) {
      continue;
    } else if (piece.color === position.sideToMove) {
      switch (piece.pieceType) {
        case PieceType.Rook:
          let rookMoves = getRookMoves(i, position.board, position.sideToMove);
          moves.push(...rookMoves);
          break;
        case PieceType.Knight:
          let knightMoves = getKnightMoves(
            i,
            position.board,
            position.sideToMove,
          );
          moves.push(...knightMoves);
          break;
        case PieceType.Bishop:
          let bishopMoves = getBishopMoves(
            i,
            position.board,
            position.sideToMove,
          );
          moves.push(...bishopMoves);
          break;
        case PieceType.Queen:
          let queenMoves = getQueenMoves(
            i,
            position.board,
            position.sideToMove,
          );
          moves.push(...queenMoves);
          break;
        case PieceType.King:
          let kingMoves = getKingMoves(i, position.board, position.sideToMove);
          moves.push(...kingMoves);
          break;
        case PieceType.Pawn:
          let pawnMoves = getPawnMoves(
            i,
            position.board,
            position.sideToMove,
            position.enPassantSquare,
          );
          moves.push(...pawnMoves);
          break;
      }
    }
  }

  let castlingMoves = getCastlingMove(position);
  moves.push(...castlingMoves);

  return moves;
}
