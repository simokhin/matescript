import { getCastlingMove, getKingMoves } from "./king";
import { getKnightMoves } from "./knight";
import { getPawnMoves } from "./pawn";
import { getBishopMoves, getQueenMoves, getRookMoves } from "./sliders";
import { PieceType, type Move, type Position } from "../types";

export function generateAllMoves(position: Position): Move[] {
  const moves: Move[] = [];

  for (let i = 0; i < 64; i++) {
    const piece = position.board[i];
    if (piece == null) {
    } else if (piece.color === position.sideToMove) {
      switch (piece.pieceType) {
        case PieceType.Rook: {
          const rookMoves = getRookMoves(i, position.board, position.sideToMove);
          moves.push(...rookMoves);
          break;
        }
        case PieceType.Knight: {
          const knightMoves = getKnightMoves(
            i,
            position.board,
            position.sideToMove,
          );
          moves.push(...knightMoves);
          break;
        }
        case PieceType.Bishop: {
          const bishopMoves = getBishopMoves(
            i,
            position.board,
            position.sideToMove,
          );
          moves.push(...bishopMoves);
          break;
        }
        case PieceType.Queen: {
          const queenMoves = getQueenMoves(
            i,
            position.board,
            position.sideToMove,
          );
          moves.push(...queenMoves);
          break;
        }
        case PieceType.King: {
          const kingMoves = getKingMoves(i, position.board, position.sideToMove);
          moves.push(...kingMoves);
          break;
        }
        case PieceType.Pawn: {
          const pawnMoves = getPawnMoves(
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
  }

  const castlingMoves = getCastlingMove(position);
  moves.push(...castlingMoves);

  return moves;
}
