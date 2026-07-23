import { expect, test } from "bun:test";
import { parseFEN } from "../position/fen";
import { NOT_PROMOTION, START_FEN } from "../constants";
import { EXACT, probeTT, storeTT } from "./tt";
import { computeHash } from "../zobrist";
import { createMove } from "../moves/move";

test("transpositional table", () => {
  const pos = parseFEN(START_FEN);
  const hash = computeHash(pos);

  const move = createMove(12, 28, false, 0, NOT_PROMOTION, false, false);

  storeTT(hash, 10, 100, EXACT, move);

  expect(probeTT(hash, 5, 10, 10)).toBe(100);
  expect(probeTT(hash, 12, 10, 10)).toBe(null);
});
