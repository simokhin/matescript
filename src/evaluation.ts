import type { Position } from "./board";
import { PieceType } from "./types";

const pieceWeights: Record<PieceType, number> = {
  [PieceType.Rook]: 500,
  [PieceType.Knight]: 300,
  [PieceType.Bishop]: 300,
  [PieceType.Queen]: 900,
  [PieceType.Pawn]: 100,
  [PieceType.King]: 0,
};

export function evaluate(position: Position): number {
  let evaluation = 0;
  let color = position.sideToMove;

  position.board.forEach((p) => {
    if (p != null) {
      if (p?.color === color) {
        evaluation += pieceWeights[p.pieceType];
      } else {
        evaluation -= pieceWeights[p.pieceType];
      }
    }
  });

  return evaluation;
}
