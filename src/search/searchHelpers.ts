import { NOT_PROMOTION } from "../constants";
import {
  getMoveCapturePiece,
  getMoveFrom,
  getMoveIsCapture,
  getMovePromotionPiece,
} from "../moves/move";
import { isSquareAttacked, oppositeColor } from "../position/board";
import type { Move, PieceType, Position } from "../types";
import { calculatePhase, pieceWeights } from "./evaluation";
import { MATE_SCORE } from "./search";
import type { SearchResult } from "./types";

export class SearchTimeoutError extends Error {}

export function moveScoreWithKiller(
  move: Move,
  position: Position,
  killers: (Move | undefined)[],
): number {
  let score = getMoveScore(move, position);
  if (move === killers[0] || move === killers[1]) {
    score += 50;
  }
  return score;
}

export function getMoveScore(move: Move, position: Position): number {
  let score = 0;

  if (getMoveIsCapture(move)) {
    // biome-ignore lint/style/noNonNullAssertion: getMoveFrom(move) always points at the square the moving piece came from, so it's never empty
    const attacker: PieceType = position.board[getMoveFrom(move)]!.pieceType;
    const victim: PieceType = getMoveCapturePiece(move);

    score = pieceWeights[victim] * 10 - pieceWeights[attacker];
  }

  return score;
}

export function formatScore(result: SearchResult): string {
  if (Math.abs(result.score) >= MATE_SCORE) {
    const pliesToMate = result.depth - (Math.abs(result.score) - MATE_SCORE);
    const mateValue = result.score > 0 ? pliesToMate : -pliesToMate;
    return `mate ${mateValue}`;
  }
  return `cp ${result.score}`;
}

export function canNullMove(position: Position, depth: number): boolean {
  if (
    isSquareAttacked(
      position,
      position.kingSquares[position.sideToMove],
      oppositeColor(position.sideToMove),
    )
  ) {
    return false;
  } else if (calculatePhase(position) === 0) {
    return false;
  } else if (depth < 3) {
    return false;
  }

  return true;
}

export function canReduce(move: Move, depth: number, moveIndex: number) {
  if (moveIndex <= 3 || depth <= 3) {
    return false;
  } else if (getMoveIsCapture(move)) {
    return false;
  } else if (getMovePromotionPiece(move) !== NOT_PROMOTION) {
    return false;
  }
  return true;
}
