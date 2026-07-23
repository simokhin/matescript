import { Color, PieceType, type Position } from "./types";

export const positionKeys: Record<
  Color,
  Record<PieceType, number[]>
> = {} as Record<Color, Record<PieceType, number[]>>;

export const sideToMoveKey = randomUint32();

export const castlingKeys = {
  whiteKingside: randomUint32(),
  whiteQueenside: randomUint32(),
  blackKingside: randomUint32(),
  blackQueenside: randomUint32(),
};

export const enPassantKeys: Record<number, number> = {} as Record<
  number,
  number
>;

for (let f = 0; f < 8; f++) {
  const number = randomUint32();
  enPassantKeys[f] = number;
}

for (let color = Color.White; color <= Color.Black; color++) {
  const pieceTypeKeys: Record<PieceType, number[]> = {} as Record<
    PieceType,
    number[]
  >;

  for (let piece = PieceType.Rook; piece <= PieceType.Pawn; piece++) {
    const squareKeys = [];

    for (let i = 0; i < 64; i++) {
      const number = randomUint32();
      squareKeys[i] = number;
    }

    pieceTypeKeys[piece] = squareKeys;
  }

  positionKeys[color] = pieceTypeKeys;
}

function randomUint32(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

export function computeHash(position: Position): number {
  let hash = 0;

  position.board.forEach((p, i) => {
    if (p != null) {
      // biome-ignore lint/style/noNonNullAssertion: i comes from forEach over a 64-square board, always 0-63, and positionKeys[color][pieceType] is always generated with exactly 64 entries
      hash ^= positionKeys[p.color][p.pieceType][i]!;
    }
  });

  if (position.sideToMove === Color.Black) {
    hash ^= sideToMoveKey;
  }

  if (position.castleRights.whiteKingside) {
    hash ^= castlingKeys.whiteKingside;
  }
  if (position.castleRights.whiteQueenside) {
    hash ^= castlingKeys.whiteQueenside;
  }
  if (position.castleRights.blackKingside) {
    hash ^= castlingKeys.blackKingside;
  }
  if (position.castleRights.blackQueenside) {
    hash ^= castlingKeys.blackQueenside;
  }

  if (position.enPassantSquare != null) {
    const col = position.enPassantSquare % 8;
    // biome-ignore lint/style/noNonNullAssertion: col is always 0-7 (square % 8), and enPassantKeys always has exactly 8 entries
    hash ^= enPassantKeys[col]!;
  }

  return hash;
}
