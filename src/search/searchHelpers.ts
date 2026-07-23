import {
  getMoveCapturePiece,
  getMoveFrom,
  getMoveIsCapture,
} from "../moves/move";
import type { Move, PieceType, Position } from "../types";
import { pieceWeights } from "./evaluation";

export class SearchTimeoutError extends Error {}

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
