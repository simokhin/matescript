import type { Board } from "../board";
import { createMove } from "../move";
import { Color, NOT_PROMOTION, PieceType, type Move } from "../types";

export function getPawnMoves(
  square: number,
  board: Board,
  color: Color,
  enPassantSquare: number | null,
): Move[] {
  let moves: Move[] = [];

  let offset = color === Color.White ? 1 : -1;

  let row = Math.floor(square / 8);
  let col = square % 8;

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
  let oneStepIndex = (row + offset) * 8 + col;

  if (board[oneStepIndex] === null && !isLastRank) {
    let newMove = createMove(
      square,
      oneStepIndex,
      false,
      0,
      NOT_PROMOTION,
      false,
    );
    moves.push(newMove);
  } else if (board[oneStepIndex] === null && isLastRank) {
    for (let i = 0; i < 4; i++) {
      let newMove = createMove(square, oneStepIndex, false, 0, i, false);
      moves.push(newMove);
    }
  }

  // Get two step pawn moves
  let twoStepIndex = (row + (offset + offset)) * 8 + col;
  if (
    isStartingSquare &&
    board[oneStepIndex] === null &&
    board[twoStepIndex] === null
  ) {
    let newMove = createMove(
      square,
      twoStepIndex,
      false,
      0,
      NOT_PROMOTION,
      false,
    );
    moves.push(newMove);
  }

  // Get pawn capture moves
  let leftCaptureSquare = (row + offset) * 8 + (col + -1);
  let rightCaptureSquare = (row + offset) * 8 + (col + 1);

  // Get left capture moves
  if (
    board[leftCaptureSquare] != null &&
    board[leftCaptureSquare]?.color !== color &&
    !isLastRank &&
    col - 1 >= 0
  ) {
    let capturePiece = board[leftCaptureSquare]?.pieceType;
    let newMove = createMove(
      square,
      leftCaptureSquare,
      true,
      capturePiece,
      NOT_PROMOTION,
      false,
    );
    moves.push(newMove);
  } else if (
    board[leftCaptureSquare] != null &&
    board[leftCaptureSquare]?.color !== color &&
    isLastRank &&
    col - 1 >= 0
  ) {
    let capturePiece = board[leftCaptureSquare]?.pieceType;
    for (let i = 0; i < 4; i++) {
      let newMove = createMove(
        square,
        leftCaptureSquare,
        true,
        capturePiece,
        i,
        false,
      );
      moves.push(newMove);
    }
  } else if (enPassantSquare === leftCaptureSquare && col - 1 >= 0) {
    let capturedPiece = PieceType.Pawn;
    let newMove = createMove(
      square,
      leftCaptureSquare,
      true,
      capturedPiece,
      NOT_PROMOTION,
      true,
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
    let capturePiece = board[rightCaptureSquare]?.pieceType;
    let newMove = createMove(
      square,
      rightCaptureSquare,
      true,
      capturePiece,
      NOT_PROMOTION,
      false,
    );
    moves.push(newMove);
  } else if (
    board[rightCaptureSquare] != null &&
    board[rightCaptureSquare]?.color !== color &&
    isLastRank &&
    col + 1 <= 7
  ) {
    let capturePiece = board[rightCaptureSquare]?.pieceType;
    for (let i = 0; i < 4; i++) {
      let newMove = createMove(
        square,
        rightCaptureSquare,
        true,
        capturePiece,
        i,
        false,
      );
      moves.push(newMove);
    }
  } else if (enPassantSquare === rightCaptureSquare && col + 1 <= 7) {
    let capturedPiece = PieceType.Pawn;
    let newMove = createMove(
      square,
      rightCaptureSquare,
      true,
      capturedPiece,
      NOT_PROMOTION,
      true,
    );
    moves.push(newMove);
  }

  return moves;
}
