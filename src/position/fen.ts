import { parseNotation } from "./board";
import { Color, PieceType, type Position } from "../types";

export function parseFEN(fen: string): Position {
  let pos: Position = {
    board: new Array(64),
    sideToMove: Color.White,
    castleRights: {
      whiteKingside: false,
      whiteQueenside: false,
      blackKingside: false,
      blackQueenside: false,
    },
    enPassantSquare: null,
    plyCount: 0,
    movesCount: 1,
    kingSquares: {
      [Color.White]: 4,
      [Color.Black]: 60,
    },
  };

  pos.board.fill(null);

  // Split FEN string
  const fenSplitted = fen.split(" ");
  const fenPosition = fenSplitted[0]?.split("/");
  if (!fenPosition) {
    throw new Error("invalid FEN string");
  }

  // Parse FEN position
  for (let row = 0; row <= 7; row++) {
    let index = 7 - row;

    let col = 0;
    let charIndex = 0;

    while (col <= 7) {
      let char = fenPosition[index]?.charAt(charIndex);

      let number = Number(char);

      let squareIndex = row * 8 + col;

      if (!isNaN(number)) {
        col += number;
        charIndex += 1;
      } else {
        col += 1;
        charIndex += 1;
        switch (char) {
          case "R":
            pos.board[squareIndex] = {
              pieceType: PieceType.Rook,
              color: Color.White,
            };
            break;
          case "r":
            pos.board[squareIndex] = {
              pieceType: PieceType.Rook,
              color: Color.Black,
            };
            break;
          case "N":
            pos.board[squareIndex] = {
              pieceType: PieceType.Knight,
              color: Color.White,
            };
            break;
          case "n":
            pos.board[squareIndex] = {
              pieceType: PieceType.Knight,
              color: Color.Black,
            };
            break;
          case "B":
            pos.board[squareIndex] = {
              pieceType: PieceType.Bishop,
              color: Color.White,
            };
            break;
          case "b":
            pos.board[squareIndex] = {
              pieceType: PieceType.Bishop,
              color: Color.Black,
            };
            break;
          case "Q":
            pos.board[squareIndex] = {
              pieceType: PieceType.Queen,
              color: Color.White,
            };
            break;
          case "q":
            pos.board[squareIndex] = {
              pieceType: PieceType.Queen,
              color: Color.Black,
            };
            break;
          case "K":
            pos.board[squareIndex] = {
              pieceType: PieceType.King,
              color: Color.White,
            };
            pos.kingSquares[Color.White] = squareIndex;
            break;
          case "k":
            pos.board[squareIndex] = {
              pieceType: PieceType.King,
              color: Color.Black,
            };
            pos.kingSquares[Color.Black] = squareIndex;
            break;
          case "P":
            pos.board[squareIndex] = {
              pieceType: PieceType.Pawn,
              color: Color.White,
            };
            break;
          case "p":
            pos.board[squareIndex] = {
              pieceType: PieceType.Pawn,
              color: Color.Black,
            };
            break;
        }
      }
    }
  }

  // Parse sideToMove
  switch (fenSplitted[1]) {
    case "w":
      pos.sideToMove = Color.White;
      break;
    case "b":
      pos.sideToMove = Color.Black;
  }

  // Parse castle rights
  if (!fenSplitted[2]) {
    throw new Error("invalid FEN string");
  }
  for (let char of fenSplitted[2]) {
    switch (char) {
      case "K":
        pos.castleRights.whiteKingside = true;
        break;
      case "Q":
        pos.castleRights.whiteQueenside = true;
        break;
      case "k":
        pos.castleRights.blackKingside = true;
        break;
      case "q":
        pos.castleRights.blackQueenside = true;
        break;
    }
  }

  // Parse en passant target square
  if (!fenSplitted[3]) {
    throw new Error("invalid FEN string");
  } else if (fenSplitted[3] === "-") {
    pos.enPassantSquare = null;
  } else {
    let enPassantSquare = parseNotation(fenSplitted[3]);
    pos.enPassantSquare = enPassantSquare;
  }

  // Parse half-moves
  if (!fenSplitted[4]) {
    throw new Error("invalid FEN string");
  } else {
    let halfMovesCount = Number(fenSplitted[4]);
    pos.plyCount = halfMovesCount;
  }

  // Parse full moves count
  if (!fenSplitted[5]) {
    throw new Error("invalid FEN string");
  } else {
    let fullMovesCount = Number(fenSplitted[5]);
    pos.movesCount = fullMovesCount;
  }

  return pos;
}
