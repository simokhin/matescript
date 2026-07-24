import { NOT_PROMOTION } from "../src/constants";
import { makeLegalMove, makeMove } from "../src/moves/makeMove";
import {
  getMoveFrom,
  getMoveIsCapture,
  getMovePromotionPiece,
  getMoveTo,
} from "../src/moves/move";
import { generateAllMoves } from "../src/moves/movegen";
import { moveToNotation, notationToMove } from "../src/notation";
import { isSquareAttacked, oppositeColor } from "../src/position/board";
import type { Move, Piece, Position } from "../src/types";
import { pieces, sounds } from "./constants";

let pos: Position;
const moveList: string[] = [];

const audioCache = {
  move: new Audio(sounds.move),
  capture: new Audio(sounds.capture),
  check: new Audio(sounds.check),
  promotion: new Audio(sounds.promotion),
};

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

    // Board rendering
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

            if (legalMoves.length === 1) {
              sendMove(legalMoves[0]!);
              moveList.push(moveToNotation(legalMoves[0]!));
            } else if (legalMoves.length > 1) {
              const picker = document.getElementById("promotion-picker");
              if (picker != null) {
                picker.innerHTML = "";
                picker.hidden = false;
                // Show promotion moves
                legalMoves.forEach((m) => {
                  const promotionPiece = document.createElement("img");
                  promotionPiece.src =
                    pieces[pos.sideToMove][getMovePromotionPiece(m)];
                  promotionPiece.addEventListener("click", () => {
                    picker.hidden = true;
                    sendMove(m);
                    moveList.push(moveToNotation(m));
                  });
                  picker.appendChild(promotionPiece);
                });
              }
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

    // Moves rendering
    let movesDiv = document.getElementById("moves");
    if (movesDiv != null) {
      movesDiv.innerHTML = "";
    }
    for (let i = 0; i < moveList.length; i += 2) {
      const moveDiv = document.createElement("div");
      moveDiv.textContent = `${i / 2 + 1}. ${moveList[i]} ${moveList[i + 1] ?? ""}`;
      movesDiv?.appendChild(moveDiv);
    }
    if (movesDiv != null) {
      movesDiv.scrollTop = movesDiv.scrollHeight;
    }
  } else if (event.data.type === "bestmove") {
    // Play move's sound for engine moves
    const engineMove = notationToMove(event.data.move, pos);
    moveList.push(event.data.move);
    const positionAfter = makeLegalMove(pos, engineMove);
    if (positionAfter != null) {
      playMoveSound(engineMove, positionAfter);
    }

    worker.postMessage({ type: "getBoard" });
  }
};

let selectedSquare: number | null = null;

const squareDivs: HTMLDivElement[] = new Array(64);

function sendMove(move: Move) {
  selectedSquare = null;

  worker.postMessage({ type: "move", move: moveToNotation(move) });

  const newPos = makeLegalMove(pos, move);
  playMoveSound(move, newPos!);

  worker.postMessage({ type: "getBoard" });

  worker.postMessage({ type: "go", movetime: 1000 });
}

// Select and highlight legal moves on the board
function selectSquare(square: number) {
  selectedSquare = square;

  const moves = generateAllMoves(pos);
  const fromSquareMoves = moves.filter((m) => getMoveFrom(m) === square);

  const legalMoves = fromSquareMoves.filter(
    (m) => makeLegalMove(pos, m) != null,
  );

  for (const m of legalMoves) {
    squareDivs[getMoveTo(m)]?.classList.add("square--highlight");
  }
}

function playMoveSound(move: Move, positionAfter: Position) {
  if (
    isSquareAttacked(
      positionAfter,
      positionAfter.kingSquares[positionAfter.sideToMove],
      oppositeColor(positionAfter.sideToMove),
    )
  ) {
    audioCache.check.currentTime = 0;
    audioCache.check.play();
  } else if (getMoveIsCapture(move)) {
    audioCache.capture.currentTime = 0;
    audioCache.capture.play();
  } else if (getMovePromotionPiece(move) !== NOT_PROMOTION) {
    audioCache.promotion.currentTime = 0;
    audioCache.promotion.play();
  } else {
    audioCache.move.currentTime = 0;
    audioCache.move.play();
  }
}
