import { expect, test } from "bun:test";
import { parseFEN } from "./fen";
import { START_FEN } from "./types";
import { evaluate } from "./evaluation";

test("evaluate material", () => {
  let pos = parseFEN(START_FEN);

  let evaluation = evaluate(pos);
  expect(evaluation).toBe(0);

  pos = parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR w KQkq - 0 1");

  evaluation = evaluate(pos);
  expect(evaluation).toBe(-900);
});
