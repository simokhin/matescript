import { expect, test } from "bun:test";
import { ParseFEN } from "./fen";
import { START_FEN } from "./types";
import { generateAllMoves } from "./movegen";

test("generate all moves on start position", () => {
  let pos = ParseFEN(START_FEN);

  let moves = generateAllMoves(pos);

  expect(moves.length).toBe(20);
});
