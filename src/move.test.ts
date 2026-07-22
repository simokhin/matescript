import { expect, test } from "bun:test";
import {
  createMove,
  getMoveCapturePiece,
  getMoveFrom,
  getMoveIsCapture,
  getMoveIsEnPassant,
  getMovePromotionPiece,
  getMoveTo,
} from "./move";
import { NO_PROMOTION, PieceType } from "./types";

test("create a move and then extract data from the move", () => {
  let move = createMove(12, 28, false, 0, NO_PROMOTION, true);

  expect(getMoveFrom(move)).toBe(12);
  expect(getMoveTo(move)).toBe(28);
  expect(getMoveIsCapture(move)).toBe(0);
  expect(getMoveCapturePiece(move)).toBe(0);
  expect(getMovePromotionPiece(move)).toBe(NO_PROMOTION);
  expect(getMoveIsEnPassant(move)).toBe(1);

  move = createMove(52, 61, true, PieceType.Queen, PieceType.Queen, false);

  expect(getMoveFrom(move)).toBe(52);
  expect(getMoveTo(move)).toBe(61);
  expect(getMoveIsCapture(move)).toBe(1);
  expect(getMoveCapturePiece(move)).toBe(PieceType.Queen);
  expect(getMovePromotionPiece(move)).toBe(PieceType.Queen);
  expect(getMoveIsEnPassant(move)).toBe(0);
});
