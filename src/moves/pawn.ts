import { NOT_PROMOTION } from "../constants";
import { createMove } from "./move";
import { Color, PieceType, type Board, type Move } from "../types";

export function getPawnMoves(
  square: number,
  board: Board,
  color: Color,
  enPassantSquare: number | null,
): Move[] {
  const moves: Move[] = [];

  const offset = color === Color.White ? 1 : -1;

  const row = Math.floor(square / 8);
  const col = square % 8;

  let isLastRank = false; // Need to know for promotion moves
  let isStartingSquare = false; // Need to know for double pawn moves

  // Check if the pawn move to the last rank and promote
  if (color === Color.White && row === 6) {
    isLastRank = true;
  } else if (color === Color.Black && row === 1) {
    isLastRank = true;
  }

  // Check if the pawn move from starting position
  if (color === Color.White && row === 1) {
    isStartingSquare = true;
  } else if (color === Color.Black && row === 6) {
    isStartingSquare = true;
  }

  // Get one step pawn moves
  const oneStepIndex = (row + offset) * 8 + col;

  if (board[oneStepIndex] === null && !isLastRank) {
    const newMove = createMove(
      square,
      oneStepIndex,
      false,
      0,
      NOT_PROMOTION,
      false,
      false,
    );
    moves.push(newMove);
  } else if (board[oneStepIndex] === null && isLastRank) {
    for (let i = 0; i < 4; i++) {
      const newMove = createMove(square, oneStepIndex, false, 0, i, false, false);
      moves.push(newMove);
    }
  }

  // Get two step pawn moves
  const twoStepIndex = (row + (offset + offset)) * 8 + col;
  if (
    isStartingSquare &&
    board[oneStepIndex] === null &&
    board[twoStepIndex] === null
  ) {
    const newMove = createMove(
      square,
      twoStepIndex,
      false,
      0,
      NOT_PROMOTION,
      false,
      false,
    );
    moves.push(newMove);
  }

  // Get pawn capture moves
  const leftCaptureSquare = (row + offset) * 8 + (col + -1);
  const rightCaptureSquare = (row + offset) * 8 + (col + 1);

  // Get left capture moves
  if (
    board[leftCaptureSquare] != null &&
    board[leftCaptureSquare]?.color !== color &&
    !isLastRank &&
    col - 1 >= 0
  ) {
    const capturePiece = board[leftCaptureSquare]?.pieceType;
    const newMove = createMove(
      square,
      leftCaptureSquare,
      true,
      capturePiece,
      NOT_PROMOTION,
      false,
      false,
    );
    moves.push(newMove);
  } else if (
    board[leftCaptureSquare] != null &&
    board[leftCaptureSquare]?.color !== color &&
    isLastRank &&
    col - 1 >= 0
  ) {
    const capturePiece = board[leftCaptureSquare]?.pieceType;
    for (let i = 0; i < 4; i++) {
      const newMove = createMove(
        square,
        leftCaptureSquare,
        true,
        capturePiece,
        i,
        false,
        false,
      );
      moves.push(newMove);
    }
  } else if (enPassantSquare === leftCaptureSquare && col - 1 >= 0) {
    const capturedPiece = PieceType.Pawn;
    const newMove = createMove(
      square,
      leftCaptureSquare,
      true,
      capturedPiece,
      NOT_PROMOTION,
      true,
      false,
    );
    moves.push(newMove);
  }

  // Get right capture moves
  if (
    board[rightCaptureSquare] != null &&
    board[rightCaptureSquare]?.color !== color &&
    !isLastRank &&
    col + 1 <= 7
  ) {
    const capturePiece = board[rightCaptureSquare]?.pieceType;
    const newMove = createMove(
      square,
      rightCaptureSquare,
      true,
      capturePiece,
      NOT_PROMOTION,
      false,
      false,
    );
    moves.push(newMove);
  } else if (
    board[rightCaptureSquare] != null &&
    board[rightCaptureSquare]?.color !== color &&
    isLastRank &&
    col + 1 <= 7
  ) {
    const capturePiece = board[rightCaptureSquare]?.pieceType;
    for (let i = 0; i < 4; i++) {
      const newMove = createMove(
        square,
        rightCaptureSquare,
        true,
        capturePiece,
        i,
        false,
        false,
      );
      moves.push(newMove);
    }
  } else if (enPassantSquare === rightCaptureSquare && col + 1 <= 7) {
    const capturedPiece = PieceType.Pawn;
    const newMove = createMove(
      square,
      rightCaptureSquare,
      true,
      capturedPiece,
      NOT_PROMOTION,
      true,
      false,
    );
    moves.push(newMove);
  }

  return moves;
}
