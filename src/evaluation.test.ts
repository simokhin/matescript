import { expect, test } from "bun:test";
import { ParseFEN } from "./fen";
import { START_FEN } from "./types";
import { evaluate } from "./evaluation";

test("evaluate material", () => {
  let pos = ParseFEN(START_FEN);

  let evaluation = evaluate(pos);

  expect(evaluation).toBe(0);
});
