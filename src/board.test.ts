import { expect, test } from "bun:test";
import { isSquareAttacked, parseNotation } from "./board";
import { ParseFEN as parseFEN } from "./fen";
import { Color } from "./types";

test("parse algebraic notation string to square index", () => {
  expect(parseNotation("a1")).toBe(0);
  expect(parseNotation("e5")).toBe(36);
  expect(parseNotation("h8")).toBe(63);
});

test("is square attacked", () => {
  let pos = parseFEN(
    "rn2k2r/5ppp/p1p5/4pb2/P2q4/2P3B1/5PPP/R1K2B1R b kq - 0 16",
  );

  expect(isSquareAttacked(pos, 18, Color.Black)).toBe(true);
  expect(isSquareAttacked(pos, 24, Color.Black)).toBe(true);
  expect(isSquareAttacked(pos, 4, Color.Black)).toBe(false);
});
