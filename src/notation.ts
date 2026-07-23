import { NOT_PROMOTION } from "./constants";
import { getMoveFrom, getMovePromotionPiece, getMoveTo } from "./moves/move";
import { generateAllMoves } from "./moves/movegen";
import { parseNotation } from "./position/board";
import { PieceType, type Move, type Position } from "./types";

export function moveToNotation(move: Move): string {
  let notation = "";

  const from = getMoveFrom(move);

  const fromCol = from % 8;
  const fromFile = String.fromCharCode("a".charCodeAt(0) + fromCol);
  notation += fromFile;

  const fromRow = Math.floor(from / 8);
  const fromRank = (fromRow + 1).toString();
  notation += fromRank;

  const to = getMoveTo(move);

  const toCol = to % 8;
  const toFile = String.fromCharCode("a".charCodeAt(0) + toCol);
  notation += toFile;

  const toRow = Math.floor(to / 8);
  const toRank = (toRow + 1).toString();
  notation += toRank;

  const promotionPiece = getMovePromotionPiece(move);
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
  const from = parseNotation(notation.slice(0, 2));
  const to = parseNotation(notation.slice(2, 4));
  let promotionPiece: PieceType = NOT_PROMOTION;

  const promotionChar = notation.length > 4 ? notation.charAt(4) : undefined;

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

  const moves = generateAllMoves(position);

  const m = moves.find(
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
