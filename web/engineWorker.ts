import { START_FEN } from "../src/constants";
import { makeLegalMove } from "../src/moves/makeMove";
import { moveToNotation, notationToMove } from "../src/notation";
import { parseFEN } from "../src/position/fen";
import { findBestMove } from "../src/search/search";
import type { SearchParameters } from "../src/search/types";

let position = parseFEN(START_FEN);
let gameHistory: number[] = [position.hash];

self.onmessage = (event: MessageEvent) => {
  const data = event.data;

  if (data.type === "newGame") {
    position = parseFEN(data.fen || START_FEN);
    gameHistory = [position.hash];
  } else if (data.type === "move") {
    const m = notationToMove(data.move, position);
    const newPos = makeLegalMove(position, m);
    if (newPos != null) {
      gameHistory.push(newPos.hash);
      position = newPos;
    }
  } else if (data.type === "go") {
    const params: SearchParameters = {
      name: "timeLimit",
      limit: data.movetime,
    };
    const result = findBestMove(position, params, gameHistory);

    if (result.bestMove !== undefined) {
      const newPos = makeLegalMove(position, result.bestMove);
      if (newPos != null) {
        gameHistory.push(newPos.hash);
        position = newPos;
      }
      self.postMessage({
        type: "bestmove",
        move: moveToNotation(result.bestMove),
        depth: result.depth,
        nodes: result.nodes,
        score: result.score,
      });
    }
  } else if (data.type === "getBoard") {
    const pos = position;

    self.postMessage({ type: "position", pos });
  }
};
