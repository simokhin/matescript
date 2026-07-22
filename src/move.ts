import type { PieceType, Move } from "./types";

export function createMove(
  from: number,
  to: number,
  isCapture: boolean,
  capturedPiceType: PieceType,
  promotion: PieceType,
  isEnPassant: boolean,
): Move {
  let move: number = 0;

  move |= from; // Add "from" square to move
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
