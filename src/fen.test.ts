import { expect, test } from "bun:test";
import { createStartPosition } from "./board";
import { ParseFEN } from "./fen";
import { START_FEN } from "./types";

test("parse FEN starting position", () => {
  let pos1 = createStartPosition();
  let pos2 = ParseFEN(START_FEN);

  expect(pos1).toEqual(pos2);
});
