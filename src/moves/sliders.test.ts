import { expect, test } from "bun:test";
import { parseFEN } from "../position/fen";
import { START_FEN } from "../constants";
import { Color } from "../types";
import { getBishopMoves, getQueenMoves, getRookMoves } from "./sliders";

test("sliding pieces on starting position", () => {
  const pos = parseFEN(START_FEN);

  const rookMoves = getRookMoves(0, pos.board, Color.White);
  expect(rookMoves.length).toBe(0);

  const bishopMoves = getBishopMoves(2, pos.board, Color.White);
  expect(bishopMoves.length).toBe(0);

  const queenMoves = getQueenMoves(3, pos.board, Color.White);
  expect(queenMoves.length).toBe(0);
});

test("generating rook moves", () => {
  // from a1 on empty board
  let pos = parseFEN("8/8/8/4k3/8/5K2/8/R7 w - - 0 1");

  let rookMoves = getRookMoves(0, pos.board, Color.White);
  expect(rookMoves.length).toBe(14);

  // rook on 1 blocked by friendly pieces
  pos = parseFEN("8/8/8/4k3/8/5K2/B7/RQ6 w - - 0 1");

  rookMoves = getRookMoves(0, pos.board, Color.White);
  expect(rookMoves.length).toBe(0);
});

test("generating bishop moves", () => {
  // from a1 on empty board
  let pos = parseFEN("8/2k5/8/8/8/5K2/8/B7 w - - 0 1");

  let bishopMoves = getBishopMoves(0, pos.board, Color.White);
  expect(bishopMoves.length).toBe(7);

  // bishop on a1 blocked by friendly piece
  pos = parseFEN("8/2k5/8/8/8/5K2/1Q6/B7 w - - 0 1");

  bishopMoves = getBishopMoves(0, pos.board, Color.White);
  expect(bishopMoves.length).toBe(0);
});

test("generating queen moves", () => {
  // from a1 on empty board
  let pos = parseFEN("8/2k5/8/8/8/5K2/8/Q7 w - - 0 1");

  let queenMoves = getQueenMoves(0, pos.board, Color.White);
  expect(queenMoves.length).toBe(21);

  // queen on a1 blocked by friendly pieces
  pos = parseFEN("8/2k5/8/8/8/5K2/RB6/QR6 w - - 0 1");

  queenMoves = getQueenMoves(0, pos.board, Color.White);
  expect(queenMoves.length).toBe(0);
});
