import { parseNotation, type Position } from "./board";
import { parseFEN } from "./fen";
import {
  getMoveFrom,
  getMovePromotionPiece,
  getMoveTo,
  makeLegalMove,
} from "./move";
import { generateAllMoves } from "./movegen";
import { findBestMove } from "./search";
import {
  AUTHOR_NAME,
  ENGINE_NAME,
  NOT_PROMOTION,
  PieceType,
  START_FEN,
  type Move,
} from "./types";

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
      if (parts[1] === "depth") {
        let depth = Number(parts[2]);

        let move = findBestMove(position, depth);
        if (move !== undefined) {
          console.log(`bestmove ${moveToNotation(move)}`);
        }
      }
      break;
  }
}

export function moveToNotation(move: Move): string {
  let notation = "";

  let from = getMoveFrom(move);

  let fromCol = from % 8;
  let fromFile = String.fromCharCode("a".charCodeAt(0) + fromCol);
  notation += fromFile;

  let fromRow = Math.floor(from / 8);
  let fromRank = (fromRow + 1).toString();
  notation += fromRank;

  let to = getMoveTo(move);

  let toCol = to % 8;
  let toFile = String.fromCharCode("a".charCodeAt(0) + toCol);
  notation += toFile;

  let toRow = Math.floor(to / 8);
  let toRank = (toRow + 1).toString();
  notation += toRank;

  let promotionPiece = getMovePromotionPiece(move);
  if (promotionPiece !== NOT_PROMOTION) {
    switch (promotionPiece) {
      case PieceType.Bishop:
        notation += "b";
        break;
      case PieceType.Knight:
        notation += "n";
        break;
      case PieceType.Queen:
        notation += "q";
        break;
      case PieceType.Rook:
        notation += "r";
        break;
    }
  }

  return notation;
}

export function notationToMove(notation: string, position: Position): Move {
  let move: Move;

  let from = parseNotation(notation.slice(0, 2));
  let to = parseNotation(notation.slice(2, 4));
  let promotionPiece: PieceType = NOT_PROMOTION;

  let promotionChar = notation.length > 4 ? notation.charAt(4) : undefined;

  if (promotionChar !== undefined) {
    switch (promotionChar) {
      case "q":
        promotionPiece = PieceType.Queen;
        break;
      case "r":
        promotionPiece = PieceType.Rook;
        break;
      case "b":
        promotionPiece = PieceType.Bishop;
        break;
      case "n":
        promotionPiece = PieceType.Knight;
    }
  }

  let moves = generateAllMoves(position);

  let m = moves.find(
    (m) =>
      getMoveFrom(m) === from &&
      getMoveTo(m) === to &&
      getMovePromotionPiece(m) === promotionPiece,
  );

  if (m === undefined) {
    throw new Error("error in parsing notation to move");
  }

  return m;
}
