import { createStartPosition } from "./board";
import { getRookMoves } from "./moves/sliders";
import { Color, PieceType} from "./types";

const letters: Record<PieceType, string> = {
  [PieceType.Rook]: "r",
  [PieceType.Knight]: "n",
  [PieceType.Bishop]: "b",
  [PieceType.Queen]: "q",
  [PieceType.King]: "k",
  [PieceType.Pawn]: "p"
}

function pieceNumberToLetter(pieceNumber: PieceType, color: Color): string {
  let letter = ""

  if (color === Color.White) {
    return letter += letters[pieceNumber].toUpperCase()
  } else  {
    return letter += letters[pieceNumber]
  }
}

const board = createStartPosition()

let boardString = ""

for (let rank = 7; rank >= 0; rank--) {
  for (let file = 0; file <= 7; file++) {
    let index = (rank * 8) + file

    if (index % 8 === 0) {
      console.log(boardString)
      boardString = ""
    }

    let piece = board[index]

    if (piece == null) {
      boardString += "x "
    } else {
      boardString += pieceNumberToLetter(piece?.pieceType, piece?.color) + " "
    }
  }
}
console.log(boardString)
