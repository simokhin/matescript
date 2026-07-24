import type { Piece } from "../src/types";
import { pieces } from "./constants";

const worker = new Worker(new URL("./engineWorker.ts", import.meta.url), {
  type: "module",
});

worker.postMessage({ type: "getBoard" });

worker.onmessage = (event) => {
  if (event.data.type === "board") {
    let boardDiv = document.getElementById("board");

    for (let r = 7; r >= 0; r--) {
      for (let c = 0; c <= 7; c++) {
        let square = r * 8 + c;

        let squareDiv = document.createElement("div");

        if ((r + c) % 2 === 0) {
          squareDiv.classList.add("square", "square--dark");
        } else {
          squareDiv.classList.add("square", "square--light");
        }

        boardDiv?.appendChild(squareDiv);

        if (event.data.board[square] != null) {
          const piece: Piece = event.data.board[square];
          let pieceImg = document.createElement("img");
          pieceImg.src = pieces[piece.color][piece.pieceType];
          squareDiv.appendChild(pieceImg);
        }
      }
    }
  }
};
