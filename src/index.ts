import { AUTHOR_NAME, ENGINE_NAME, START_FEN } from "./constants";
import { parseFEN } from "./position/fen";
import { findBestMove } from "./search/search";
import type { SearchParameters } from "./search/types";
import { Color } from "./types";
import { makeLegalMove } from "./moves/makeMove";
import { moveToNotation, notationToMove } from "./notation";
import { formatScore } from "./search/searchHelpers";

const timeKeys: Record<Color, { time: string; inc: string }> = {
  [Color.White]: { time: "wtime", inc: "winc" },
  [Color.Black]: { time: "btime", inc: "binc" },
};

let position = parseFEN(START_FEN);
let gameHistory: number[] = [];

for await (const line of console) {
  const parts = line.split(" ");

  switch (parts[0]) {
    case "uci":
      console.log(`id name ${ENGINE_NAME}`);
      console.log(`id author ${AUTHOR_NAME}`);
      console.log("uciok");
      break;
    case "isready":
      console.log("readyok");
      break;
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: process.exit() never returns
    case "quit":
      process.exit();
    case "position":
      if (parts[1] === "startpos") {
        position = parseFEN(START_FEN);

        gameHistory = [];
        gameHistory.push(position.hash);

        if (parts[2] === "moves") {
          const moves = parts.slice(3);

          for (const move of moves) {
            const m = notationToMove(move, position);
            const newPos = makeLegalMove(position, m);

            if (newPos != null) {
              gameHistory.push(newPos.hash);
              position = newPos;
            }
          }
        }
      } else if (parts[1] === "fen") {
        if (parts[2] === undefined) {
          throw new Error("FEN string is undefined");
        }
        const fenString = parts.slice(2, 8).join(" ");
        position = parseFEN(fenString);

        gameHistory = [];
        gameHistory.push(position.hash);

        if (parts[8] === "moves") {
          const moves = parts.slice(9);

          for (const move of moves) {
            const m = notationToMove(move, position);
            const newPos = makeLegalMove(position, m);
            if (newPos != null) {
              gameHistory.push(newPos.hash);
              position = newPos;
            }
          }
        }
      }
      break;
    case "go": {
      const goParts = parts.slice(1);
      const parsedGoParts: Record<string, string> = {};

      for (let i = 0; i < goParts.length; i += 2) {
        const key = goParts[i];
        const value = goParts[i + 1];

        if (key !== undefined && value !== undefined) {
          parsedGoParts[key] = value;
        }
      }

      if ("depth" in parsedGoParts) {
        const depth: SearchParameters = {
          name: "maxDepth",
          depth: Number(parsedGoParts.depth),
        };

        const result = findBestMove(position, depth, gameHistory);
        if (result.bestMove !== undefined) {
          const score = formatScore(result);
          console.log(
            `info depth ${result.depth} nodes ${result.nodes} ${score}`,
          );
          console.log(`bestmove ${moveToNotation(result.bestMove)}`);
        }
      } else if ("movetime" in parsedGoParts) {
        const moveTime: SearchParameters = {
          name: "timeLimit",
          limit: Number(parsedGoParts.movetime),
        };

        const result = findBestMove(position, moveTime, gameHistory);
        if (result.bestMove !== undefined) {
          const score = formatScore(result);
          console.log(
            `info depth ${result.depth} nodes ${result.nodes} score ${score}`,
          );
          console.log(`bestmove ${moveToNotation(result.bestMove)}`);
        }
      } else if ("wtime" in parsedGoParts) {
        const timeFotMove =
          Number(parsedGoParts[timeKeys[position.sideToMove].time]) / 30 +
          Number(parsedGoParts[timeKeys[position.sideToMove].inc]) * 0.8;

        const moveTime: SearchParameters = {
          name: "timeLimit",
          limit: timeFotMove,
        };

        const result = findBestMove(position, moveTime, gameHistory);
        if (result.bestMove !== undefined) {
          const score = formatScore(result);
          console.log(
            `info depth ${result.depth} nodes ${result.nodes} ${score}`,
          );
          console.log(`bestmove ${moveToNotation(result.bestMove)}`);
        }
      }
      break;
    }
  }
}
