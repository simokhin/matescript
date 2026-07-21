export enum PieceType {
  Rook,
  Knight,
  Bishop,
  Queen,
  King,
  Pawn
}

export enum Color {
  White,
  Black
}

export type Piece = {
  pieceType: PieceType,
  color: Color
}

export type Square = Piece | null
