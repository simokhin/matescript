import { NOT_PROMOTION } from "../constants";
import { isSquareAttacked, oppositeColor } from "../position/board";
import { Color, PieceType, type Move, type Position } from "../types";
import { computeHash } from "../zobrist";
import {
  getMoveCapturePiece,
  getMoveFrom,
  getMoveIsCapture,
  getMoveIsCastle,
  getMoveIsEnPassant,
  getMovePromotionPiece,
  getMoveTo,
} from "./move";

export function makeLegalMove(position: Position, move: Move): Position | null {
  const newPos = makeMove(position, move);
  const opp = oppositeColor(position.sideToMove);
  if (isSquareAttacked(newPos, newPos.kingSquares[position.sideToMove], opp)) {
    return null;
  }
  return newPos;
}

export function makeMove(position: Position, move: Move): Position {
  const newBoard = {
    ...position,
    board: [...position.board],
    castleRights: { ...position.castleRights },
    kingSquares: { ...position.kingSquares },
  };

  const from = getMoveFrom(move);
  const to = getMoveTo(move);
  const isCastle = getMoveIsCastle(move);
  const isCapture = getMoveIsCapture(move);
  const capturedPiece = getMoveCapturePiece(move);
  const promotionPiece = getMovePromotionPiece(move);
  const isEnPassant = getMoveIsEnPassant(move);

  const movingPiece = newBoard.board[from];
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
    const row = Math.floor(to / 8);
    const col = to % 8;
    if (position.sideToMove === Color.White) {
      const newIndex = (row - 1) * 8 + col;
      newBoard.board[newIndex] = null;
    } else if (position.sideToMove === Color.Black) {
      const newIndex = (row + 1) * 8 + col;
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
      newBoard.kingSquares[Color.White] = to;
      newBoard.castleRights.whiteKingside = false;
      newBoard.castleRights.whiteQueenside = false;
    } else if (position.sideToMove === Color.Black) {
      newBoard.kingSquares[Color.Black] = to;
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

  // TODO: replace with incremental XOR updates (only squares that changed), instead of recomputing the hash over the whole board — makeMove is a hot path
  newBoard.hash = computeHash(newBoard);

  return newBoard;
}
