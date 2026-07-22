import { kingDeltas } from "./moves/king";
import { knightDeltas } from "./moves/knight";
import { bishopDeltas, rookDeltas } from "./moves/sliders";
import { Color, PieceType, type Square } from "./types";

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
};

export function createStartPosition(): Position {
  let pos: Position = {
    board: [],
    sideToMove: Color.White,
    castleRights: {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    },
    enPassantSquare: null,
    plyCount: 0,
    movesCount: 1,
    kingSquares: {
      [Color.White]: 4,
      [Color.Black]: 60,
    },
  };

  let board: Board = new Array(64);
  board.fill(null);

  // Rooks
  board[0] = { pieceType: PieceType.Rook, color: Color.White };
  board[7] = { pieceType: PieceType.Rook, color: Color.White };

  board[56] = { pieceType: PieceType.Rook, color: Color.Black };
  board[63] = { pieceType: PieceType.Rook, color: Color.Black };

  // Knights
  board[1] = { pieceType: PieceType.Knight, color: Color.White };
  board[6] = { pieceType: PieceType.Knight, color: Color.White };

  board[57] = { pieceType: PieceType.Knight, color: Color.Black };
  board[62] = { pieceType: PieceType.Knight, color: Color.Black };

  // Bishops
  board[2] = { pieceType: PieceType.Bishop, color: Color.White };
  board[5] = { pieceType: PieceType.Bishop, color: Color.White };

  board[58] = { pieceType: PieceType.Bishop, color: Color.Black };
  board[61] = { pieceType: PieceType.Bishop, color: Color.Black };

  // Queens
  board[3] = { pieceType: PieceType.Queen, color: Color.White };
  board[59] = { pieceType: PieceType.Queen, color: Color.Black };

  // Kings
  board[4] = { pieceType: PieceType.King, color: Color.White };
  board[60] = { pieceType: PieceType.King, color: Color.Black };

  // White pawns
  for (let i = 8; i <= 15; i++) {
    board[i] = {
      pieceType: PieceType.Pawn,
      color: Color.White,
    };
  }

  // Black pawns
  for (let i = 48; i <= 55; i++) {
    board[i] = {
      pieceType: PieceType.Pawn,
      color: Color.Black,
    };
  }

  pos.board = board;

  return pos;
}

export function parseNotation(square: string): number {
  const letter = square.charAt(0);
  const digit = square.charAt(1);

  const col = letter.charCodeAt(0) - "a".charCodeAt(0);
  const row = Number(digit);

  return (row - 1) * 8 + col;
}

export function isSquareAttacked(
  position: Position,
  square: number,
  byColor: Color,
): boolean {
  const row = Math.floor(square / 8);
  const col = square % 8;

  // By Knight
  for (const { deltaRow, deltaCol } of knightDeltas) {
    let newRow = row + deltaRow;
    let newCol = col + deltaCol;

    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
      let newIndex = newRow * 8 + newCol;
      if (position.board[newIndex] == null) {
        continue;
      } else if (
        position.board[newIndex].pieceType === PieceType.Knight &&
        position.board[newIndex].color === byColor
      ) {
        return true;
      }
    }
  }

  // By King
  for (const { deltaRow, deltaCol } of kingDeltas) {
    let newRow = row + deltaRow;
    let newCol = col + deltaCol;

    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
      let newIndex = newRow * 8 + newCol;
      if (position.board[newIndex] == null) {
        continue;
      } else if (
        position.board[newIndex].pieceType === PieceType.King &&
        position.board[newIndex].color === byColor
      ) {
        return true;
      }
    }
  }

  // By Rook or Queen
  for (const { deltaRow, deltaCol } of rookDeltas) {
    let step = 1;
    while (true) {
      let newRow = row + deltaRow * step;
      let newCol = col + deltaCol * step;

      if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
        let newIndex = newRow * 8 + newCol;
        if (position.board[newIndex] != null) {
          if (
            position.board[newIndex].color === byColor &&
            (position.board[newIndex].pieceType === PieceType.Rook ||
              position.board[newIndex].pieceType === PieceType.Queen)
          ) {
            return true;
          }
          break;
        }
      } else {
        break;
      }
      step++;
    }
  }

  // By Bishop or Queen
  for (const { deltaRow, deltaCol } of bishopDeltas) {
    let step = 1;
    while (true) {
      let newRow = row + deltaRow * step;
      let newCol = col + deltaCol * step;

      if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
        let newIndex = newRow * 8 + newCol;
        if (position.board[newIndex] != null) {
          if (
            position.board[newIndex].color === byColor &&
            (position.board[newIndex].pieceType === PieceType.Bishop ||
              position.board[newIndex].pieceType === PieceType.Queen)
          ) {
            return true;
          }
          break;
        }
      } else {
        break;
      }
      step++;
    }
  }

  // By Pawn
  if (byColor === Color.White) {
    let newRow = row - 1;
    let leftCol = col - 1;
    let leftIndex = newRow * 8 + leftCol;

    if (
      position.board[leftIndex] !== null &&
      position.board[leftIndex]?.pieceType === PieceType.Pawn &&
      position.board[leftIndex].color === byColor &&
      leftCol >= 0
    ) {
      return true;
    }

    let rightCol = col + 1;
    let rightIndex = newRow * 8 + rightCol;

    if (
      position.board[rightIndex] !== null &&
      position.board[rightIndex]?.pieceType === PieceType.Pawn &&
      position.board[rightIndex].color === byColor &&
      rightCol <= 7
    ) {
      return true;
    }
  } else if (byColor === Color.Black) {
    let newRow = row + 1;
    let leftCol = col - 1;
    let leftIndex = newRow * 8 + leftCol;

    if (
      position.board[leftIndex] !== null &&
      position.board[leftIndex]?.pieceType === PieceType.Pawn &&
      position.board[leftIndex].color === byColor &&
      leftCol >= 0
    ) {
      return true;
    }

    let rightCol = col + 1;
    let rightIndex = newRow * 8 + rightCol;

    if (
      position.board[rightIndex] !== null &&
      position.board[rightIndex]?.pieceType === PieceType.Pawn &&
      position.board[rightIndex].color === byColor &&
      rightCol <= 7
    ) {
      return true;
    }
  }

  return false;
}

export function oppositeColor(color: Color): Color {
  return color === Color.White ? Color.Black : Color.White;
}
