import { PieceType } from "./types";

// General information
export const ENGINE_NAME = "MateScript";
export const AUTHOR_NAME = "Nikita Simokhin";

// Moves related constant
export const NOT_PROMOTION: PieceType = PieceType.King;

// Position related constants
export const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const letters: Record<PieceType, string> = {
  [PieceType.Rook]: "r",
  [PieceType.Knight]: "n",
  [PieceType.Bishop]: "b",
  [PieceType.Queen]: "q",
  [PieceType.King]: "k",
  [PieceType.Pawn]: "p",
};
