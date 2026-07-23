import { expect, test } from "bun:test";
import { createStartPosition } from "../position/board";
import { getPawnMoves } from "./pawn";
import { Color } from "../types";

test("get pawn moves", () => {
  let pos = createStartPosition();

  let moves = getPawnMoves(12, pos.board, Color.White, pos.enPassantSquare);

  expect(moves.length).toBe(2);
});
