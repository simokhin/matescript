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

export type Move = number;

export const NO_PROMOTION: PieceType = PieceType.King;
