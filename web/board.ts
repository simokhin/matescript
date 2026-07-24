import type { Piece, Position } from "../src/types";
import { pieces } from "./constants";

export function renderBoard(
  pos: Position,
  squareDivs: HTMLDivElement[],
  onSquareClick: (square: number) => void,
  flipped: boolean,
): void {
  const boardDiv = document.getElementById("board");
  if (boardDiv != null) {
    boardDiv.innerHTML = "";
  }

  for (let visualRow = 0; visualRow <= 7; visualRow++) {
    for (let visualCol = 0; visualCol <= 7; visualCol++) {
      const r = flipped ? visualRow : 7 - visualRow;
      const c = flipped ? 7 - visualCol : visualCol;
      const square = r * 8 + c;

      const squareDiv = document.createElement("div");
      squareDivs[square] = squareDiv;

      squareDiv.addEventListener("click", () => onSquareClick(square));

      if ((r + c) % 2 === 0) {
        squareDiv.classList.add("square", "square--dark");
      } else {
        squareDiv.classList.add("square", "square--light");
      }

      boardDiv?.appendChild(squareDiv);

      if (pos.board[square] != null) {
        const piece: Piece = pos.board[square];
        const pieceImg = document.createElement("img");
        pieceImg.src = pieces[piece.color][piece.pieceType];
        squareDiv.appendChild(pieceImg);
      }
    }
  }
}

export function highlightSquares(
  squareDivs: HTMLDivElement[],
  squares: number[],
): void {
  for (const square of squares) {
    squareDivs[square]?.classList.add("square--highlight");
  }
}

export function clearHighlights(squareDivs: HTMLDivElement[]): void {
  squareDivs.forEach((div) => {
    div.classList.remove("square--highlight");
  });
}
