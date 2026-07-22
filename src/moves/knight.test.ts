import { expect, test } from "bun:test";
import { parseFEN } from "../fen";
import { Color, START_FEN, type Move } from "../types";
import { getKnightMoves } from "./knight";

test("generate knight moves", () => {
  let pos = parseFEN(START_FEN);

  // All knights on starting position
  let knightMoves = getKnightMoves(1, pos.board, Color.White);
  expect(knightMoves.length).toBe(2);

  knightMoves = getKnightMoves(6, pos.board, Color.White);
  expect(knightMoves.length).toBe(2);

  knightMoves = getKnightMoves(57, pos.board, Color.Black);
  expect(knightMoves.length).toBe(2);

  knightMoves = getKnightMoves(62, pos.board, Color.Black);
  expect(knightMoves.length).toBe(2);

  // Knight in the center of the board
  pos = parseFEN("8/8/8/8/4N3/8/8/8 w - - 0 1");
  knightMoves = getKnightMoves(28, pos.board, Color.White);
  expect(knightMoves.length).toBe(8);
});
