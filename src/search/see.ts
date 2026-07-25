import { kingDeltas } from "../moves/king";
import { knightDeltas } from "../moves/knight";
import { getMoveCapturePiece, getMoveFrom, getMoveTo } from "../moves/move";
import { bishopDeltas, rookDeltas } from "../moves/sliders";
import { oppositeColor } from "../position/board";
import { Color, PieceType, type Move, type Piece, type Position } from "../types";
import { pieceWeights } from "./evaluation";

export function findLeastValuableAttacker(
  board: (Piece | null)[],
  square: number,
  color: Color,
) {
  let cheapest: {
    square: number;
    pieceType: PieceType;
  } | null = null;

  const row = Math.floor(square / 8);
  const col = square % 8;

  // By Knight
  for (const { deltaRow, deltaCol } of knightDeltas) {
    const newRow = row + deltaRow;
    const newCol = col + deltaCol;

    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
      const newIndex = newRow * 8 + newCol;
      if (board[newIndex] == null) {
      } else if (
        board[newIndex].pieceType === PieceType.Knight &&
        board[newIndex].color === color
      ) {
        if (
          cheapest === null ||
          pieceWeights[board[newIndex].pieceType] <
            pieceWeights[cheapest.pieceType]
        ) {
          cheapest = { square: newIndex, pieceType: board[newIndex].pieceType };
        }
      }
    }
  }

  // By King
  for (const { deltaRow, deltaCol } of kingDeltas) {
    const newRow = row + deltaRow;
    const newCol = col + deltaCol;

    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
      const newIndex = newRow * 8 + newCol;
      if (board[newIndex] == null) {
      } else if (
        board[newIndex].pieceType === PieceType.King &&
        board[newIndex].color === color
      ) {
        if (
          cheapest === null ||
          pieceWeights[board[newIndex].pieceType] <
            pieceWeights[cheapest.pieceType]
        ) {
          cheapest = { square: newIndex, pieceType: board[newIndex].pieceType };
        }
      }
    }
  }

  // By Rook or Queen
  for (const { deltaRow, deltaCol } of rookDeltas) {
    let step = 1;
    while (true) {
      const newRow = row + deltaRow * step;
      const newCol = col + deltaCol * step;

      if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
        const newIndex = newRow * 8 + newCol;
        if (board[newIndex] != null) {
          if (
            board[newIndex].color === color &&
            (board[newIndex].pieceType === PieceType.Rook ||
              board[newIndex].pieceType === PieceType.Queen)
          ) {
            if (
              cheapest === null ||
              pieceWeights[board[newIndex].pieceType] <
                pieceWeights[cheapest.pieceType]
            ) {
              cheapest = {
                square: newIndex,
                pieceType: board[newIndex].pieceType,
              };
            }
          }
          break;
        }
      } else {
        break;
      }
      step++;
    }
  }

  // By Bishop or Queen
  for (const { deltaRow, deltaCol } of bishopDeltas) {
    let step = 1;
    while (true) {
      const newRow = row + deltaRow * step;
      const newCol = col + deltaCol * step;

      if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
        const newIndex = newRow * 8 + newCol;
        if (board[newIndex] != null) {
          if (
            board[newIndex].color === color &&
            (board[newIndex].pieceType === PieceType.Bishop ||
              board[newIndex].pieceType === PieceType.Queen)
          ) {
            if (
              cheapest === null ||
              pieceWeights[board[newIndex].pieceType] <
                pieceWeights[cheapest.pieceType]
            ) {
              cheapest = {
                square: newIndex,
                pieceType: board[newIndex].pieceType,
              };
            }
          }
          break;
        }
      } else {
        break;
      }
      step++;
    }
  }

  // By Pawn
  if (color === Color.White) {
    const newRow = row - 1;
    const leftCol = col - 1;
    const leftIndex = newRow * 8 + leftCol;

    if (
      board[leftIndex] !== null &&
      board[leftIndex]?.pieceType === PieceType.Pawn &&
      board[leftIndex].color === color &&
      leftCol >= 0
    ) {
      if (
        cheapest === null ||
        pieceWeights[PieceType.Pawn] < pieceWeights[cheapest.pieceType]
      ) {
        cheapest = { square: leftIndex, pieceType: PieceType.Pawn };
      }
    }

    const rightCol = col + 1;
    const rightIndex = newRow * 8 + rightCol;

    if (
      board[rightIndex] !== null &&
      board[rightIndex]?.pieceType === PieceType.Pawn &&
      board[rightIndex].color === color &&
      rightCol <= 7
    ) {
      if (
        cheapest === null ||
        pieceWeights[PieceType.Pawn] < pieceWeights[cheapest.pieceType]
      ) {
        cheapest = { square: rightIndex, pieceType: PieceType.Pawn };
      }
    }
  } else if (color === Color.Black) {
    const newRow = row + 1;
    const leftCol = col - 1;
    const leftIndex = newRow * 8 + leftCol;

    if (
      board[leftIndex] !== null &&
      board[leftIndex]?.pieceType === PieceType.Pawn &&
      board[leftIndex].color === color &&
      leftCol >= 0
    ) {
      if (
        cheapest === null ||
        pieceWeights[PieceType.Pawn] < pieceWeights[cheapest.pieceType]
      ) {
        cheapest = { square: leftIndex, pieceType: PieceType.Pawn };
      }
    }

    const rightCol = col + 1;
    const rightIndex = newRow * 8 + rightCol;

    if (
      board[rightIndex] !== null &&
      board[rightIndex]?.pieceType === PieceType.Pawn &&
      board[rightIndex].color === color &&
      rightCol <= 7
    ) {
      if (
        cheapest === null ||
        pieceWeights[PieceType.Pawn] < pieceWeights[cheapest.pieceType]
      ) {
        cheapest = { square: rightIndex, pieceType: PieceType.Pawn };
      }
    }
  }

  return cheapest;
}

export function see(
  board: (Piece | null)[],
  targetSquare: number,
  side: Color,
  capturedValue: number,
): number {
  const attacker = findLeastValuableAttacker(board, targetSquare, side);
  if (attacker == null) {
    return 0;
  }

  let newBoard = [...board];
  newBoard[attacker.square] = null;
  newBoard[targetSquare] = { color: side, pieceType: attacker.pieceType };

  const attackerValue = pieceWeights[attacker.pieceType];
  const result = see(
    newBoard,
    targetSquare,
    oppositeColor(side),
    attackerValue,
  );

  return Math.max(0, capturedValue - result);
}

export function evaluateSEE(position: Position, move: Move): number {
  const from = getMoveFrom(move);
  const to = getMoveTo(move);

  // biome-ignore lint/style/noNonNullAssertion: getMoveFrom(move) always points at the square the moving piece came from, so it's never empty
  const attackerPiece = position.board[from]!;
  const attackerValue = pieceWeights[attackerPiece.pieceType];
  const victimValue = pieceWeights[getMoveCapturePiece(move) as PieceType];

  const newBoard = [...position.board];
  newBoard[from] = null;
  newBoard[to] = attackerPiece;

  const result = see(
    newBoard,
    to,
    oppositeColor(attackerPiece.color),
    attackerValue,
  );

  return victimValue - result;
}
