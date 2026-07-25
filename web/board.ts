import type { Piece, Position } from "../src/types";
import { pieces } from "./constants";

export type LastMove = { from: number; to: number };

export function renderBoard(
  pos: Position,
  squareDivs: HTMLDivElement[],
  onSquareClick: (square: number) => void,
  flipped: boolean,
  lastMove: LastMove | null,
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

      if (
        lastMove != null &&
        (square === lastMove.from || square === lastMove.to)
      ) {
        squareDiv.classList.add("square--lastmove");
      }

      if (visualCol === 0) {
        const rankLabel = document.createElement("span");
        rankLabel.className = "coord coord--rank";
        rankLabel.textContent = String(r + 1);
        squareDiv.appendChild(rankLabel);
      }

      if (visualRow === 7) {
        const fileLabel = document.createElement("span");
        fileLabel.className = "coord coord--file";
        fileLabel.textContent = String.fromCharCode(97 + c);
        squareDiv.appendChild(fileLabel);
      }

      boardDiv?.appendChild(squareDiv);

      if (pos.board[square] != null) {
        const piece: Piece = pos.board[square];
        const pieceImg = document.createElement("img");
        pieceImg.src = pieces[piece.color][piece.pieceType];
        pieceImg.draggable = false;
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
