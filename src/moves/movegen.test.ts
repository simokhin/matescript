import { expect, test } from "bun:test";
import { parseFEN } from "../position/fen";
import { START_FEN } from "../constants";
import { generateAllMoves } from "./movegen";

test("generate all moves on start position", () => {
  let pos = parseFEN(START_FEN);

  let moves = generateAllMoves(pos);

  expect(moves.length).toBe(20);
});
