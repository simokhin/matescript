import { expect, test } from "bun:test";
import { perft } from "./perft";
import { parseFEN } from "./position/fen";
import { START_FEN } from "./constants";

test.skip("perft test", () => {
  let pos = parseFEN(START_FEN);

  let nodes = perft(pos, 1);
  expect(nodes).toBe(20);

  nodes = perft(pos, 2);
  expect(nodes).toBe(400);

  nodes = perft(pos, 3);
  expect(nodes).toBe(8_902);

  nodes = perft(pos, 4);
  expect(nodes).toBe(197_281);

  nodes = perft(pos, 5);
  expect(nodes).toBe(4_865_609);

  pos = parseFEN("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");

  nodes = perft(pos, 1);
  expect(nodes).toBe(14);

  nodes = perft(pos, 2);
  expect(nodes).toBe(191);

  nodes = perft(pos, 3);
  expect(nodes).toBe(2_812);

  nodes = perft(pos, 4);
  expect(nodes).toBe(43_238);

  nodes = perft(pos, 5);
  expect(nodes).toBe(674_624);
});
