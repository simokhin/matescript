import { expect, test } from "bun:test";
import { ParseFEN } from "../fen";
import { Color, START_FEN, type Move } from "../types";
import { getKingMoves } from "./king";

test("generate king moves", () => {
  let pos = ParseFEN(START_FEN);

  // King on starting position
  let kingMoves = getKingMoves(4, pos.board, Color.White);
  expect(kingMoves.length).toBe(0);

  kingMoves = getKingMoves(60, pos.board, Color.Black);
  expect(kingMoves.length).toBe(0);

  // King in the center of the board
  pos = ParseFEN("k7/8/8/8/4K3/8/8/8 w - - 0 1");
  kingMoves = getKingMoves(28, pos.board, Color.White);
  expect(kingMoves.length).toBe(8);

  // King in the center of the board surrounded with two white pieces
  pos = ParseFEN("k7/8/8/3N4/4K3/5B2/8/8 w - - 0 1");
  kingMoves = getKingMoves(28, pos.board, Color.White);
  expect(kingMoves.length).toBe(6);
});
