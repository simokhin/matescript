import { expect, test } from "bun:test";
import { parseNotation } from "./board";

test("parse algebraic notation string to square index", () => {
  expect(parseNotation("a1")).toBe(0);
  expect(parseNotation("e5")).toBe(36);
  expect(parseNotation("h8")).toBe(63);
});
