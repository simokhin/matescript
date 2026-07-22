import type { Position } from "./board";
import { type Move, NOT_PROMOTION, Color, PieceType } from "./types";

export function makeMove(position: Position, move: Move): Position {
  const newBoard = {
    ...position,
    board: [...position.board],
    castleRights: { ...position.castleRights },
    kingSquares: { ...position.kingSquares },
  };

  let from = getMoveFrom(move);
  let to = getMoveTo(move);
  let isCastle = getMoveIsCastle(move);
  let isCapture = getMoveIsCapture(move);
  let capturedPiece = getMoveCapturePiece(move);
  let promotionPiece = getMovePromotionPiece(move);
  let isEnPassant = getMoveIsEnPassant(move);

  let movingPiece = newBoard.board[from];
  if (!movingPiece) {
    throw new Error("error in making move");
  }

  newBoard.board[from] = null;
  newBoard.board[to] = movingPiece;

  if (isCapture) {
    newBoard.plyCount = 0;
  }

  if (promotionPiece !== NOT_PROMOTION) {
    newBoard.board[to] = {
      pieceType: promotionPiece,
      color: position.sideToMove,
    };
  }

  if (isEnPassant) {
    let row = Math.floor(to / 8);
    let col = to % 8;
    if (position.sideToMove === Color.White) {
      let newIndex = (row - 1) * 8 + col;
      newBoard.board[newIndex] = null;
    } else if (position.sideToMove === Color.Black) {
      let newIndex = (row + 1) * 8 + col;
      newBoard.board[newIndex] = null;
    }
  }

  if (isCastle) {
    switch (to) {
      case 2:
        newBoard.board[0] = null;
        newBoard.board[3] = {
          pieceType: PieceType.Rook,
          color: Color.White,
        };
        break;
      case 6:
        newBoard.board[7] = null;
        newBoard.board[5] = {
          pieceType: PieceType.Rook,
          color: Color.White,
        };
        break;
      case 58:
        newBoard.board[56] = null;
        newBoard.board[59] = {
          pieceType: PieceType.Rook,
          color: Color.Black,
        };
        break;
      case 62:
        newBoard.board[63] = null;
        newBoard.board[61] = {
          pieceType: PieceType.Rook,
          color: Color.Black,
        };
        break;
    }
  }

  if (position.sideToMove === Color.White) {
    newBoard.sideToMove = Color.Black;
  } else if (position.sideToMove === Color.Black) {
    newBoard.sideToMove = Color.White;
  }

  if (position.board[from]?.pieceType === PieceType.King) {
    if (position.sideToMove === Color.White) {
      newBoard.kingSquares.white = to;
      newBoard.castleRights.whiteKingside = false;
      newBoard.castleRights.whiteQueenside = false;
    } else if (position.sideToMove === Color.Black) {
      newBoard.kingSquares.black = to;
      newBoard.castleRights.blackKingside = false;
      newBoard.castleRights.blackQueenside = false;
    }
  } else if (position.board[from]?.pieceType === PieceType.Rook) {
    if (position.sideToMove === Color.White && from === 0) {
      newBoard.castleRights.whiteQueenside = false;
    } else if (position.sideToMove === Color.White && from === 7) {
      newBoard.castleRights.whiteKingside = false;
    } else if (position.sideToMove === Color.Black && from === 56) {
      newBoard.castleRights.blackQueenside = false;
    } else if (position.sideToMove === Color.Black && from === 63) {
      newBoard.castleRights.blackKingside = false;
    }
  }

  if (isCapture && capturedPiece === PieceType.Rook && to === 0) {
    newBoard.castleRights.whiteQueenside = false;
  } else if (isCapture && capturedPiece === PieceType.Rook && to === 7) {
    newBoard.castleRights.whiteKingside = false;
  } else if (isCapture && capturedPiece === PieceType.Rook && to === 56) {
    newBoard.castleRights.blackQueenside = false;
  } else if (isCapture && capturedPiece === PieceType.Rook && to === 63) {
    newBoard.castleRights.blackKingside = false;
  }

  if (movingPiece.pieceType === PieceType.Pawn) {
    if (position.sideToMove === Color.White && to - from === 16) {
      newBoard.enPassantSquare = to - 8;
    } else if (position.sideToMove === Color.Black && from - to === 16) {
      newBoard.enPassantSquare = to + 8;
    } else {
      newBoard.enPassantSquare = null;
    }
  } else {
    newBoard.enPassantSquare = null;
  }

  if (isCapture || position.board[from]?.pieceType === PieceType.Pawn) {
    newBoard.plyCount = 0;
  } else {
    newBoard.plyCount += 1;
  }

  if (position.sideToMove === Color.Black) {
    newBoard.movesCount += 1;
  }

  return newBoard;
}

export function createMove(
  from: number,
  to: number,
  isCapture: boolean,
  capturedPiceType: PieceType,
  promotion: PieceType,
  isEnPassant: boolean,
  isCastle: boolean,
): Move {
  let move: number = 0;

  if (isCastle) {
    move |= 1;
  } else {
    move |= 0;
  }

  move = (move << 6) | from; // Add "from" square to move
  move = (move << 6) | to; // Add "to" square to move

  // Add a flag if move is a capture
  if (isCapture) {
    move = (move << 1) | 1;
  } else {
    move = (move << 1) | 0;
  }

  move = (move << 3) | capturedPiceType; // Add what piece was captured

  move = (move << 3) | promotion; // Add a piece to pawn was promoted

  // Add a flag if move is an en isEnPassant
  if (isEnPassant) {
    move = (move << 1) | 1;
  } else {
    move = (move << 1) | 0;
  }

  return move as Move;
}

export function getMoveIsCastle(move: Move): number {
  return (move >> 20) & 1;
}

export function getMoveFrom(move: Move): number {
  return (move >> 14) & ((1 << 6) - 1);
}

export function getMoveTo(move: Move): number {
  return (move >> 8) & ((1 << 6) - 1);
}

export function getMoveIsCapture(move: Move): number {
  return (move >> 7) & 1;
}

export function getMoveCapturePiece(move: Move): number {
  return (move >> 4) & ((1 << 3) - 1);
}

export function getMovePromotionPiece(move: Move): number {
  return (move >> 1) & ((1 << 3) - 1);
}

export function getMoveIsEnPassant(move: Move): number {
  return move & 1;
}
