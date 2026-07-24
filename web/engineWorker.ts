import { START_FEN } from "../src/constants";
import { makeLegalMove } from "../src/moves/makeMove";
import { generateAllMoves } from "../src/moves/movegen";
import { moveToNotation, notationToMove } from "../src/notation";
import { isSquareAttacked, oppositeColor } from "../src/position/board";
import { parseFEN } from "../src/position/fen";
import { findBestMove } from "../src/search/search";
import type { SearchParameters } from "../src/search/types";
import type { Color } from "../src/types";

let position = parseFEN(START_FEN);
let gameHistory: number[] = [position.hash];

function checkGameOver(): {
  over: boolean;
  reason?: "checkmate" | "stalemate";
  winner?: Color;
} {
  const moves = generateAllMoves(position);
  const hasLegalMove = moves.some((m) => makeLegalMove(position, m) != null);

  if (hasLegalMove) {
    return { over: false };
  }

  const inCheck = isSquareAttacked(
    position,
    position.kingSquares[position.sideToMove],
    oppositeColor(position.sideToMove),
  );

  return {
    over: true,
    reason: inCheck ? "checkmate" : "stalemate",
    winner: inCheck ? oppositeColor(position.sideToMove) : undefined,
  };
}

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
    const gameOverState = checkGameOver();

    if (gameOverState.over) {
      self.postMessage({
        type: "gameOver",
        reason: gameOverState.reason,
        winner: gameOverState.winner,
      });
    } else {
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

        const gameOverAfter = checkGameOver();
        if (gameOverAfter.over) {
          self.postMessage({
            type: "gameOver",
            reason: gameOverAfter.reason,
            winner: gameOverAfter.winner,
          });
        }
      }
    }
  } else if (data.type === "getBoard") {
    const pos = position;

    self.postMessage({ type: "position", pos });
  }
};
