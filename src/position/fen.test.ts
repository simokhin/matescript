import { expect, test } from "bun:test";
import { createStartPosition } from "./board";
import { parseFEN } from "./fen";
import { START_FEN } from "../constants";

test("parse FEN starting position", () => {
  let pos1 = createStartPosition();
  let pos2 = parseFEN(START_FEN);

  expect(pos1).toEqual(pos2);
});
