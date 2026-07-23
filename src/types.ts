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

type Brand<T, B> = T & { __brand: B };

export type Move = Brand<number, "Move">;

export type Board = Square[];

export type Position = {
  board: Square[];
  sideToMove: Color;
  castleRights: {
    whiteKingside: boolean;
    whiteQueenside: boolean;
    blackKingside: boolean;
    blackQueenside: boolean;
  };
  enPassantSquare: number | null;
  plyCount: number;
  movesCount: number;
  kingSquares: Record<Color, number>;
  hash: number;
};
