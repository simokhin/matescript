import {
  BISHOP_PST,
  KING_ENDGAME_PST,
  KING_PST,
  KNIGHT_PST,
  PAWN_PST,
  QUEEN_PST,
  ROOK_PST,
} from "./pst";
import { Color, PieceType, type Position } from "../types";
import { oppositeColor } from "../position/board";

export const pieceWeights: Record<PieceType, number> = {
  [PieceType.Rook]: 500,
  [PieceType.Knight]: 300,
  [PieceType.Bishop]: 300,
  [PieceType.Queen]: 900,
  [PieceType.Pawn]: 100,
  [PieceType.King]: 0,
};

export const pieceSquareTables: Record<PieceType, number[]> = {
  [PieceType.Rook]: ROOK_PST,
  [PieceType.Knight]: KNIGHT_PST,
  [PieceType.Bishop]: BISHOP_PST,
  [PieceType.Queen]: QUEEN_PST,
  [PieceType.Pawn]: PAWN_PST,
  [PieceType.King]: KING_PST,
};

const PASSED_PAWN_MG = [0, 5, 10, 20, 35, 60, 100, 0];
const PASSED_PAWN_EG = [0, 10, 20, 40, 70, 120, 200, 0];

export function evaluate(position: Position): number {
  let evaluation = 0;

  const color = position.sideToMove;

  const phase = calculatePhase(position);

  position.board.forEach((p, i) => {
    if (p == null) {
      return;
    }

    const sign = p.color === color ? 1 : -1;
    const normalizedSquare = p.color === Color.White ? i : i ^ 56;
    const rank = Math.floor(i / 8);
    const normalizedRank = p.color === Color.White ? rank : 7 - rank;

    evaluation += sign * pieceWeights[p.pieceType];
    evaluation += sign * getPstValue(p.pieceType, normalizedSquare, phase);

    if (p.pieceType === PieceType.Pawn && isPassedPawn(position, i, p.color)) {
      evaluation += sign * getPassedPawnBonus(normalizedRank, phase);
    }
  });

  const pawnsCount = countPawnsByFile(position);
  evaluation += pawnStructureScore(pawnsCount, color);
  evaluation -= pawnStructureScore(pawnsCount, oppositeColor(color));

  return evaluation;
}

export function calculatePhase(position: Position): number {
  let score = 0;

  position.board.forEach((p) => {
    if (p != null) {
      switch (p.pieceType) {
        case PieceType.Knight:
          score += 1;
          break;
        case PieceType.Bishop:
          score += 1;
          break;
        case PieceType.Rook:
          score += 2;
          break;
        case PieceType.Queen:
          score += 4;
          break;
      }
    }
  });

  return score;
}

function getPassedPawnBonus(rank: number, phase: number): number {
  let mg = PASSED_PAWN_MG[rank]!;
  let eg = PASSED_PAWN_EG[rank]!;

  return (mg * phase + eg * (24 - phase)) / 24;
}

function getPstValue(
  pieceType: PieceType,
  square: number,
  phase: number,
): number {
  let mg: number;
  let eg: number;

  if (pieceType === PieceType.King) {
    // biome-ignore lint/style/noNonNullAssertion: square is always 0-63, and KING_PST always has exactly 64 entries
    mg = KING_PST[square]!;
    // biome-ignore lint/style/noNonNullAssertion: square is always 0-63, and KING_ENDGAME_PST always has exactly 64 entries
    eg = KING_ENDGAME_PST[square]!;
    return (mg * phase + eg * (24 - phase)) / 24;
  } else {
    // biome-ignore lint/style/noNonNullAssertion: square is always 0-63, and pieceSquareTables[pieceType] always has exactly 64 entries
    return pieceSquareTables[pieceType][square]!;
  }
}

function countPawnsByFile(position: Position): Record<Color, number[]> {
  let pawnsCount: Record<Color, number[]> = {
    [Color.White]: new Array(8).fill(0),
    [Color.Black]: new Array(8).fill(0),
  };

  position.board.forEach((p, i) => {
    let file = i % 8;

    if (p?.pieceType === PieceType.Pawn) {
      pawnsCount[p.color][file]! += 1;
    }
  });

  return pawnsCount;
}

function pawnStructureScore(
  pawnsCount: Record<Color, number[]>,
  color: Color,
): number {
  let penalty = 0;

  for (let i = 0; i <= 7; i++) {
    if (pawnsCount[color][i]! > 1) {
      penalty += -10;
    }
    if (
      i === 0 &&
      pawnsCount[color][i]! > 0 &&
      pawnsCount[color][i + 1] === 0
    ) {
      penalty += -10;
    } else if (
      i === 7 &&
      pawnsCount[color][i]! > 0 &&
      pawnsCount[color][i - 1] === 0
    ) {
      penalty += -10;
    } else if (
      pawnsCount[color][i]! > 0 &&
      pawnsCount[color][i - 1] === 0 &&
      pawnsCount[color][i + 1] === 0
    ) {
      penalty += -10;
    }
  }

  return penalty;
}

function isPassedPawn(
  position: Position,
  square: number,
  color: Color,
): boolean {
  const file = square % 8;
  const rank = Math.floor(square / 8);

  const enemyColor = oppositeColor(color);
  const direction = color === Color.White ? 1 : -1;

  for (let r = rank + direction; r >= 0 && r <= 7; r += direction) {
    for (let f = file - 1; f <= file + 1; f++) {
      if (f < 0 || f > 7) {
        continue;
      }

      const targetSquare = r * 8 + f;
      const piece = position.board[targetSquare];

      if (piece?.color === enemyColor && piece.pieceType === PieceType.Pawn) {
        return false;
      }
    }
  }

  return true;
}
