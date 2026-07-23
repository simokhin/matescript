export enum PieceType {
  Rook,
  Knight,
  Bishop,
  Queen,
  King,
  Pawn,
}

export enum Color {
  White,
  Black,
}

export type Piece = {
  pieceType: PieceType;
  color: Color;
};

export type Square = Piece | null;

export type Delta = {
  deltaRow: number;
  deltaCol: number;
};

// Branded type technique
type Brand<T, B> = T & { __brand: B };

export type Move = Brand<number, "Move">;

export const NOT_PROMOTION: PieceType = PieceType.King;

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

export const ENGINE_NAME = "TypeScript Chess Engine";
export const AUTHOR_NAME = "Nikita Simokhin";
