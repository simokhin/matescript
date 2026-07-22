import { expect, test } from "bun:test";
import {
  createMove,
  getMoveIsCastle as getMoveIsCastle,
  getMoveCapturePiece,
  getMoveFrom,
  getMoveIsCapture,
  getMoveIsEnPassant,
  getMovePromotionPiece,
  getMoveTo,
  makeMove,
} from "./move";
import { Color, NOT_PROMOTION, PieceType, START_FEN } from "./types";
import { ParseFEN } from "./fen";

test("create a move and then extract data from the move", () => {
  let move = createMove(12, 28, false, 0, NOT_PROMOTION, true, false);

  expect(getMoveFrom(move)).toBe(12);
  expect(getMoveTo(move)).toBe(28);
  expect(getMoveIsCapture(move)).toBe(0);
  expect(getMoveCapturePiece(move)).toBe(0);
  expect(getMovePromotionPiece(move)).toBe(NOT_PROMOTION);
  expect(getMoveIsEnPassant(move)).toBe(1);

  move = createMove(
    52,
    61,
    true,
    PieceType.Queen,
    PieceType.Queen,
    false,
    false,
  );

  expect(getMoveFrom(move)).toBe(52);
  expect(getMoveTo(move)).toBe(61);
  expect(getMoveIsCapture(move)).toBe(1);
  expect(getMoveCapturePiece(move)).toBe(PieceType.Queen);
  expect(getMovePromotionPiece(move)).toBe(PieceType.Queen);
  expect(getMoveIsEnPassant(move)).toBe(0);
  expect(getMoveIsCastle(move)).toBe(0);
});

test("make a move", () => {
  let pos = ParseFEN(START_FEN);

  let move = createMove(12, 28, false, 0, NOT_PROMOTION, true, false);
  let newPos = makeMove(pos, move);

  expect(newPos.enPassantSquare).toBe(20);
  expect(newPos.board[12]).toBe(null);
  expect(newPos.board[28]?.pieceType).toBe(PieceType.Pawn);

  pos = ParseFEN(
    "r1bqkbnr/ppp2ppp/2np4/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
  );

  move = createMove(4, 6, false, 0, NOT_PROMOTION, false, true);
  newPos = makeMove(pos, move);

  expect(newPos.board[7]).toBe(null);
  expect(newPos.castleRights.whiteKingside).toBe(false);
  expect(newPos.castleRights.whiteQueenside).toBe(false);

  pos = ParseFEN(
    "rnbqkbnr/pppp2pp/8/4p3/4PpP1/2NP4/PPP2P1P/R1BQKBNR b KQkq g3 0 4",
  );

  move = createMove(29, 22, true, PieceType.Pawn, NOT_PROMOTION, true, false);
  newPos = makeMove(pos, move);

  expect(newPos.board[22]?.pieceType).toBe(PieceType.Pawn);
  expect(newPos.board[22]?.color).toBe(Color.Black);
  expect(newPos.board[29]).toBe(null);
  expect(newPos.board[30]).toBe(null);

  pos = ParseFEN("1q6/P7/8/8/2k5/4K3/8/8 w - - 0 1");

  move = createMove(
    48,
    57,
    true,
    PieceType.Queen,
    PieceType.Queen,
    false,
    false,
  );
  newPos = makeMove(pos, move);

  expect(newPos.board[57]?.pieceType).toBe(PieceType.Queen);
  expect(newPos.board[57]?.color).toBe(Color.White);
});
