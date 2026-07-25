import { Color, PieceType, type Position } from "../src/types";
import { pieces } from "./constants";

export type LastMove = { from: number; to: number };

const pieceNames: Record<PieceType, string> = {
  [PieceType.Rook]: "Rook",
  [PieceType.Knight]: "Knight",
  [PieceType.Bishop]: "Bishop",
  [PieceType.Queen]: "Queen",
  [PieceType.King]: "King",
  [PieceType.Pawn]: "Pawn",
};

const colorNames: Record<Color, string> = {
  [Color.White]: "White",
  [Color.Black]: "Black",
};

function squareName(square: number): string {
  const rank = Math.floor(square / 8);
  const file = square % 8;
  return `${String.fromCharCode(97 + file)}${rank + 1}`;
}

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

      squareDiv.tabIndex = 0;
      squareDiv.setAttribute("role", "button");

      const piece = pos.board[square];
      squareDiv.setAttribute(
        "aria-label",
        piece != null
          ? `${colorNames[piece.color]} ${pieceNames[piece.pieceType]}, ${squareName(square)}`
          : `Empty square, ${squareName(square)}`,
      );

      squareDiv.addEventListener("click", () => onSquareClick(square));
      squareDiv.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSquareClick(square);
        }
      });

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

      if (piece != null) {
        const pieceImg = document.createElement("img");
        pieceImg.src = pieces[piece.color][piece.pieceType];
        pieceImg.draggable = false;
        pieceImg.alt = "";
        squareDiv.appendChild(pieceImg);
      }
    }
  }
}

export function highlightSelected(
  squareDivs: HTMLDivElement[],
  square: number,
): void {
  squareDivs[square]?.classList.add("square--selected");
}

export function highlightSquares(
  squareDivs: HTMLDivElement[],
  quietSquares: number[],
  captureSquares: number[],
): void {
  for (const square of quietSquares) {
    squareDivs[square]?.classList.add("square--highlight");
  }
  for (const square of captureSquares) {
    squareDivs[square]?.classList.add("square--highlight", "square--capture");
  }
}

export function clearHighlights(squareDivs: HTMLDivElement[]): void {
  squareDivs.forEach((div) => {
    div.classList.remove(
      "square--highlight",
      "square--capture",
      "square--selected",
    );
  });
}
