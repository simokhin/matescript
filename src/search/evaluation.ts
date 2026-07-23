import {
  BISHOP_PST,
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

  position.board.forEach((p, i) => {
    if (p != null) {
      if (p?.color === color) {
        evaluation += pieceWeights[p.pieceType];
        if (p.color === Color.White) {
          // biome-ignore lint/style/noNonNullAssertion: i comes from forEach over a 64-square board, always 0-63, and PST arrays always have 64 elements
          evaluation += pieceSquareTables[p.pieceType][i]!;
        } else {
          // biome-ignore lint/style/noNonNullAssertion: i ^ 56 stays within 0-63 (mirrors rank, keeps file), and PST arrays always have 64 elements
          evaluation += pieceSquareTables[p.pieceType][i ^ 56]!;
        }
      } else {
        evaluation -= pieceWeights[p.pieceType];
        if (p.color === Color.White) {
          // biome-ignore lint/style/noNonNullAssertion: i comes from forEach over a 64-square board, always 0-63, and PST arrays always have 64 elements
          evaluation -= pieceSquareTables[p.pieceType][i]!;
        } else {
          // biome-ignore lint/style/noNonNullAssertion: i ^ 56 stays within 0-63 (mirrors rank, keeps file), and PST arrays always have 64 elements
          evaluation -= pieceSquareTables[p.pieceType][i ^ 56]!;
        }
      }
    }
  });

  return evaluation;
}
