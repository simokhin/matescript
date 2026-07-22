import { expect, test } from "bun:test";
import { parseFEN } from "../fen";
import { Color, START_FEN, type Move } from "../types";
import { getCastlingMove, getKingMoves } from "./king";

test("generate king moves", () => {
  let pos = parseFEN(START_FEN);

  // King on starting position
  let kingMoves = getKingMoves(4, pos.board, Color.White);
  expect(kingMoves.length).toBe(0);

  kingMoves = getKingMoves(60, pos.board, Color.Black);
  expect(kingMoves.length).toBe(0);

  // King in the center of the board
  pos = parseFEN("k7/8/8/8/4K3/8/8/8 w - - 0 1");
  kingMoves = getKingMoves(28, pos.board, Color.White);
  expect(kingMoves.length).toBe(8);

  // King in the center of the board surrounded with two white pieces
  pos = parseFEN("k7/8/8/3N4/4K3/5B2/8/8 w - - 0 1");
  kingMoves = getKingMoves(28, pos.board, Color.White);
  expect(kingMoves.length).toBe(6);
});

test("generate castle move", () => {
  let pos = parseFEN(START_FEN);

  let castleMoves = getCastlingMove(pos);
  expect(castleMoves.length).toBe(0);

  pos = parseFEN(
    "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  );
  castleMoves = getCastlingMove(pos);
  expect(castleMoves.length).toBe(1);

  pos = parseFEN(
    "r3k2r/ppp1qppp/2np1n2/2b1p3/2B1P1P1/2NPBN2/PPP2PP1/R2QK2R b KQkq - 0 8",
  );
  castleMoves = getCastlingMove(pos);
  expect(castleMoves.length).toBe(2);

  pos = parseFEN(
    "r6r/pppkqppp/2np4/2b1p2n/2B1P1P1/2NPBN2/PPPK1PP1/R2Q3R w - - 3 10",
  );
  castleMoves = getCastlingMove(pos);
  expect(castleMoves.length).toBe(0);

  pos = parseFEN(
    "r2q1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NPBbP1/PPPQ1P1P/R3K2R w KQ - 1 9",
  );
  castleMoves = getCastlingMove(pos);
  expect(castleMoves.length).toBe(1);
});
