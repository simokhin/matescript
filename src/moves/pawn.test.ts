import { expect, test } from "bun:test";
import { createStartPosition } from "../board";
import { getPawnMoves } from "./pawn";
import { Color } from "../types";

test("get pawn moves", () => {
  let board = createStartPosition();

  let moves = getPawnMoves(12, board, Color.White, null);

  expect(moves.length).toBe(2);
});
