import { expect, test } from "bun:test";
import {
  createMove,
  getIsCastle as getMoveIsCastle,
  getMoveCapturePiece,
  getMoveFrom,
  getMoveIsCapture,
  getMoveIsEnPassant,
  getMovePromotionPiece,
  getMoveTo,
} from "./move";
import { NOT_PROMOTION, PieceType } from "./types";

test("create a move and then extract data from the move", () => {
  let move = createMove(12, 28, false, 0, NOT_PROMOTION, true, false);

  expect(getMoveFrom(move)).toBe(12);
  expect(getMoveTo(move)).toBe(28);
  expect(getMoveIsCapture(move)).toBe(0);
  expect(getMoveCapturePiece(move)).toBe(0);
  expect(getMovePromotionPiece(move)).toBe(NOT_PROMOTION);
  expect(getMoveIsEnPassant(move)).toBe(1);

  move = createMove(
    52,
    61,
    true,
    PieceType.Queen,
    PieceType.Queen,
    false,
    false,
  );

  expect(getMoveFrom(move)).toBe(52);
  expect(getMoveTo(move)).toBe(61);
  expect(getMoveIsCapture(move)).toBe(1);
  expect(getMoveCapturePiece(move)).toBe(PieceType.Queen);
  expect(getMovePromotionPiece(move)).toBe(PieceType.Queen);
  expect(getMoveIsEnPassant(move)).toBe(0);
  expect(getMoveIsCastle(move)).toBe(0);
});
