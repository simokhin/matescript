import { NOT_PROMOTION } from "./constants";
import { getMoveFrom, getMovePromotionPiece, getMoveTo } from "./moves/move";
import { generateAllMoves } from "./moves/movegen";
import { parseNotation } from "./position/board";
import { PieceType, type Move, type Position } from "./types";

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
