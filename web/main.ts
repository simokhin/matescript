import { makeLegalMove, makeMove } from "../src/moves/makeMove";
import { getMoveFrom, getMoveTo } from "../src/moves/move";
import { generateAllMoves } from "../src/moves/movegen";
import { moveToNotation } from "../src/notation";
import type { Piece, Position } from "../src/types";
import { pieces } from "./constants";

let pos: Position;

const worker = new Worker(new URL("./engineWorker.ts", import.meta.url), {
  type: "module",
});

worker.postMessage({ type: "getBoard" });

worker.onmessage = (event) => {
  if (event.data.type === "position") {
    pos = event.data.pos;

    let boardDiv = document.getElementById("board");
    if (boardDiv != null) {
      boardDiv.innerHTML = "";
    }

    for (let r = 7; r >= 0; r--) {
      for (let c = 0; c <= 7; c++) {
        let square = r * 8 + c;

        let squareDiv = document.createElement("div");
        squareDivs[square] = squareDiv;

        squareDiv.addEventListener("click", () => {
          if (selectedSquare === null) {
            selectSquare(square);
          } else if (selectedSquare != null) {
            squareDivs.forEach((div) =>
              div.classList.remove("square--highlight"),
            );

            const moves = generateAllMoves(pos);
            const toSquareMoves = moves.filter(
              (m) =>
                getMoveFrom(m) === selectedSquare && getMoveTo(m) === square,
            );

            const legalMoves = toSquareMoves.filter(
              (m) => makeLegalMove(pos, m) != null,
            );

            if (legalMoves.length > 0) {
              selectedSquare = null;
              let move = moveToNotation(legalMoves[0]!);

              worker.postMessage({ type: "move", move: move });
              worker.postMessage({ type: "getBoard" });
              worker.postMessage({ type: "go", movetime: 1000 });
            } else if (legalMoves.length === 0) {
              selectSquare(square);
            }
          }
        });

        if ((r + c) % 2 === 0) {
          squareDiv.classList.add("square", "square--dark");
        } else {
          squareDiv.classList.add("square", "square--light");
        }

        boardDiv?.appendChild(squareDiv);

        if (event.data.pos.board[square] != null) {
          const piece: Piece = event.data.pos.board[square];
          let pieceImg = document.createElement("img");
          pieceImg.src = pieces[piece.color][piece.pieceType];
          squareDiv.appendChild(pieceImg);
        }
      }
    }
  } else if (event.data.type === "bestmove") {
    worker.postMessage({ type: "getBoard" });
  }
};

let selectedSquare: number | null = null;

const squareDivs: HTMLDivElement[] = new Array(64);

function selectSquare(square: number) {
  selectedSquare = square;

  const moves = generateAllMoves(pos);
  const fromSquareMoves = moves.filter((m) => getMoveFrom(m) === square);

  const legalMoves = fromSquareMoves.filter(
    (m) => makeLegalMove(pos, m) != null,
  );

  // Highlight lelal moves on the board
  for (const m of legalMoves) {
    squareDivs[getMoveTo(m)]?.classList.add("square--highlight");
  }
}
