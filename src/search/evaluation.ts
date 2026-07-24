import {
  BISHOP_PST,
  KING_ENDGAME_PST,
  KING_PST,
  KNIGHT_PST,
  PAWN_PST,
  QUEEN_PST,
  ROOK_PST,
} from "./pst";
import { Color, PieceType, type Position } from "../types";

export const pieceWeights: Record<PieceType, number> = {
  [PieceType.Rook]: 500,
  [PieceType.Knight]: 300,
  [PieceType.Bishop]: 300,
  [PieceType.Queen]: 900,
  [PieceType.Pawn]: 100,
  [PieceType.King]: 0,
};

export const pieceSquareTables: Record<PieceType, number[]> = {
  [PieceType.Rook]: ROOK_PST,
  [PieceType.Knight]: KNIGHT_PST,
  [PieceType.Bishop]: BISHOP_PST,
  [PieceType.Queen]: QUEEN_PST,
  [PieceType.Pawn]: PAWN_PST,
  [PieceType.King]: KING_PST,
};

export function evaluate(position: Position): number {
  let evaluation = 0;

  const color = position.sideToMove;

  const phase = calculatePhase(position);

  position.board.forEach((p, i) => {
    if (p != null) {
      if (p?.color === color) {
        evaluation += pieceWeights[p.pieceType];
        if (p.color === Color.White) {
          evaluation += getPstValue(p.pieceType, i, phase);
        } else {
          evaluation += getPstValue(p.pieceType, i ^ 56, phase);
        }
      } else {
        evaluation -= pieceWeights[p.pieceType];
        if (p.color === Color.White) {
          evaluation -= getPstValue(p.pieceType, i, phase);
        } else {
          evaluation -= getPstValue(p.pieceType, i ^ 56, phase);
        }
      }
    }
  });

  return evaluation;
}

function calculatePhase(position: Position): number {
  let score = 0;

  position.board.forEach((p) => {
    if (p != null) {
      switch (p.pieceType) {
        case PieceType.Knight:
          score += 1;
          break;
        case PieceType.Bishop:
          score += 1;
          break;
        case PieceType.Rook:
          score += 2;
          break;
        case PieceType.Queen:
          score += 4;
          break;
      }
    }
  });

  return score;
}

function getPstValue(
  pieceType: PieceType,
  square: number,
  phase: number,
): number {
  let mg: number;
  let eg: number;

  if (pieceType === PieceType.King) {
    // biome-ignore lint/style/noNonNullAssertion: square is always 0-63, and KING_PST always has exactly 64 entries
    mg = KING_PST[square]!;
    // biome-ignore lint/style/noNonNullAssertion: square is always 0-63, and KING_ENDGAME_PST always has exactly 64 entries
    eg = KING_ENDGAME_PST[square]!;
    return (mg * phase + eg * (24 - phase)) / 24;
  } else {
    // biome-ignore lint/style/noNonNullAssertion: square is always 0-63, and pieceSquareTables[pieceType] always has exactly 64 entries
    return pieceSquareTables[pieceType][square]!;
  }
}
