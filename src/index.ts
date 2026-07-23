import { AUTHOR_NAME, ENGINE_NAME, START_FEN } from "./constants";
import { parseFEN } from "./position/fen";
import { findBestMove } from "./search/search";
import type { SearchParameters } from "./search/types";
import { Color } from "./types";
import { makeLegalMove } from "./moves/makeMove";
import { moveToNotation, notationToMove } from "./notation";

let timeKeys: Record<Color, { time: string; inc: string }> = {
  [Color.White]: { time: "wtime", inc: "winc" },
  [Color.Black]: { time: "btime", inc: "binc" },
};

let position = parseFEN(START_FEN);

for await (const line of console) {
  let parts = line.split(" ");

  switch (parts[0]) {
    case "uci":
      console.log(`id name ${ENGINE_NAME}`);
      console.log(`id author ${AUTHOR_NAME}`);
      console.log("uciok");
      break;
    case "isready":
      console.log("readyok");
      break;
    case "quit":
      process.exit();
    case "position":
      if (parts[1] === "startpos") {
        position = parseFEN(START_FEN);

        if (parts[2] === "moves") {
          let moves = parts.slice(3);

          for (let move of moves) {
            let m = notationToMove(move, position);
            let newPos = makeLegalMove(position, m);
            if (newPos != null) {
              position = newPos;
            }
          }
        }
      } else if (parts[1] === "fen") {
        if (parts[2] === undefined) {
          throw new Error("FEN string is undefined");
        }
        let fenString = parts.slice(2, 8).join(" ");
        position = parseFEN(fenString);

        if (parts[8] === "moves") {
          let moves = parts.slice(9);

          for (let move of moves) {
            let m = notationToMove(move, position);
            let newPos = makeLegalMove(position, m);
            if (newPos != null) {
              position = newPos;
            }
          }
        }
      }
      break;
    case "go":
      let goParts = parts.slice(1);
      let parsedGoParts: Record<string, string> = {};

      for (let i = 0; i < goParts.length; i += 2) {
        let key = goParts[i];
        let value = goParts[i + 1];

        if (key !== undefined && value !== undefined) {
          parsedGoParts[key] = value;
        }
      }

      if ("depth" in parsedGoParts) {
        let depth: SearchParameters = {
          name: "maxDepth",
          depth: Number(parsedGoParts.depth),
        };

        let result = findBestMove(position, depth);
        if (result.bestMove !== undefined) {
          console.log(`info depth ${result.depth} nodes ${result.nodes}`);
          console.log(`bestmove ${moveToNotation(result.bestMove)}`);
        }
      } else if ("movetime" in parsedGoParts) {
        let moveTime: SearchParameters = {
          name: "timeLimit",
          limit: Number(parsedGoParts.movetime),
        };

        let result = findBestMove(position, moveTime);
        if (result.bestMove !== undefined) {
          console.log(`info depth ${result.depth} nodes ${result.nodes}`);
          console.log(`bestmove ${moveToNotation(result.bestMove)}`);
        }
      } else if ("wtime" in parsedGoParts) {
        let timeFotMove =
          Number(parsedGoParts[timeKeys[position.sideToMove].time]) / 30 +
          Number(parsedGoParts[timeKeys[position.sideToMove].inc]) * 0.8;

        let moveTime: SearchParameters = {
          name: "timeLimit",
          limit: timeFotMove,
        };

        let result = findBestMove(position, moveTime);
        if (result.bestMove !== undefined) {
          console.log(`info depth ${result.depth} nodes ${result.nodes}`);
          console.log(`bestmove ${moveToNotation(result.bestMove)}`);
        }
      }
      break;
  }
}
