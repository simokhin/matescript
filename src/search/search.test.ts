import { expect, test } from "bun:test";
import { parseFEN } from "../position/fen";
import { search } from "./search";

test("negamax test", () => {
  const pos = parseFEN("1R6/P7/1Nb2p2/6kp/8/6KP/3r2P1/8 b - - 0 47"); // Mate in 1

  let gameHisrory = [];
  gameHisrory.push(pos.hash);

  const evaluation = search(pos, 2, -Infinity, Infinity, gameHisrory);
  expect(evaluation).toBe(1_000_001);
});
