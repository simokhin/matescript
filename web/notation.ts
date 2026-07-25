import { NOT_PROMOTION } from "../src/constants";
import { makeLegalMove } from "../src/moves/makeMove";
import {
  getMoveFrom,
  getMoveIsCapture,
  getMoveIsCastle,
  getMovePromotionPiece,
  getMoveTo,
} from "../src/moves/move";
import { generateAllMoves } from "../src/moves/movegen";
import { isSquareAttacked, oppositeColor } from "../src/position/board";
import { type Move, PieceType, type Position } from "../src/types";

const pieceLetters: Record<PieceType, string> = {
  [PieceType.King]: "K",
  [PieceType.Queen]: "Q",
  [PieceType.Rook]: "R",
  [PieceType.Bishop]: "B",
  [PieceType.Knight]: "N",
  [PieceType.Pawn]: "",
};

function squareName(square: number): string {
  const file = square % 8;
  const rank = Math.floor(square / 8);
  return `${String.fromCharCode(97 + file)}${rank + 1}`;
}

// Standard algebraic disambiguation: prefer the departure file, fall back to
// the rank, and only fall back to the full square when both collide with
// another legal mover of the same piece type.
function disambiguation(
  positionBefore: Position,
  pieceType: PieceType,
  from: number,
  to: number,
): string {
  const otherMovers = generateAllMoves(positionBefore)
    .filter((m) => getMoveTo(m) === to && getMoveFrom(m) !== from)
    .filter((m) => {
      const p = positionBefore.board[getMoveFrom(m)];
      return (
        p != null &&
        p.pieceType === pieceType &&
        p.color === positionBefore.board[from]?.color
      );
    })
    .filter((m) => makeLegalMove(positionBefore, m) != null);

  if (otherMovers.length === 0) {
    return "";
  }

  const fromFile = from % 8;
  const fromRank = Math.floor(from / 8);

  const sameFile = otherMovers.some((m) => getMoveFrom(m) % 8 === fromFile);
  if (!sameFile) {
    return squareName(from).charAt(0);
  }

  const sameRank = otherMovers.some(
    (m) => Math.floor(getMoveFrom(m) / 8) === fromRank,
  );
  if (!sameRank) {
    return squareName(from).charAt(1);
  }

  return squareName(from);
}

function checkSuffix(move: Move, positionBefore: Position): string {
  const positionAfter = makeLegalMove(positionBefore, move);
  if (positionAfter == null) {
    return "";
  }

  const opponent = positionAfter.sideToMove;
  const inCheck = isSquareAttacked(
    positionAfter,
    positionAfter.kingSquares[opponent],
    oppositeColor(opponent),
  );

  if (!inCheck) {
    return "";
  }

  const hasReply = generateAllMoves(positionAfter).some(
    (m) => makeLegalMove(positionAfter, m) != null,
  );

  return hasReply ? "+" : "#";
}

// Converts a move to standard algebraic notation (e4, Nf3, exd5, O-O,
// e8=Q#, ...). Needs the position *before* the move for disambiguation and
// capture detection, and derives check/mate suffixes by playing the move out
// — it never touches or depends on engine search/eval logic.
export function moveToSAN(move: Move, positionBefore: Position): string {
  const from = getMoveFrom(move);
  const to = getMoveTo(move);
  const piece = positionBefore.board[from];

  if (piece == null) {
    return `${squareName(from)}${squareName(to)}`;
  }

  if (getMoveIsCastle(move)) {
    const isKingside = to % 8 === 6;
    const castleSan = isKingside ? "O-O" : "O-O-O";
    return castleSan + checkSuffix(move, positionBefore);
  }

  const isCapture = getMoveIsCapture(move) === 1;
  const promotionPiece = getMovePromotionPiece(move);
  const isPromotion = promotionPiece !== NOT_PROMOTION;

  let san = "";

  if (piece.pieceType === PieceType.Pawn) {
    if (isCapture) {
      san += squareName(from).charAt(0);
    }
  } else {
    san += pieceLetters[piece.pieceType];
    san += disambiguation(positionBefore, piece.pieceType, from, to);
  }

  if (isCapture) {
    san += "x";
  }

  san += squareName(to);

  if (isPromotion) {
    san += `=${pieceLetters[promotionPiece]}`;
  }

  san += checkSuffix(move, positionBefore);

  return san;
}
