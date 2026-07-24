import type { Piece, Position } from "../src/types";
import { pieces } from "./constants";

export function renderBoard(
  pos: Position,
  squareDivs: HTMLDivElement[],
  onSquareClick: (square: number) => void,
): void {
  const boardDiv = document.getElementById("board");
  if (boardDiv != null) {
    boardDiv.innerHTML = "";
  }

  for (let r = 7; r >= 0; r--) {
    for (let c = 0; c <= 7; c++) {
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
