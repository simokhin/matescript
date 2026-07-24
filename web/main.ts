import { makeLegalMove } from "../src/moves/makeMove";
import {
  getMoveFrom,
  getMovePromotionPiece,
  getMoveTo,
} from "../src/moves/move";
import { generateAllMoves } from "../src/moves/movegen";
import { moveToNotation, notationToMove } from "../src/notation";
import { Color, type Move, type Position } from "../src/types";
import { clearHighlights, highlightSquares, renderBoard } from "./board";
import { pieces } from "./constants";
import { renderEngineInfo, resetEngineInfo } from "./engineInfo";
import { renderMoves } from "./moves";
import { playMoveSound } from "./sound";

let pos: Position;
const moveList: string[] = [];
let selectedSquare: number | null = null;
const squareDivs: HTMLDivElement[] = new Array(64);

let movetime = 1000;
let selectedSide: Color = Color.White;

const worker = new Worker(new URL("./engineWorker.ts", import.meta.url), {
  type: "module",
});

worker.postMessage({ type: "getBoard" });

worker.onmessage = (event) => {
  if (event.data.type === "position") {
    pos = event.data.pos;

    renderBoard(pos, squareDivs, onSquareClick);
    renderMoves(moveList);
  } else if (event.data.type === "bestmove") {
    renderEngineInfo(event.data.depth, event.data.nodes, event.data.score);

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

function onSquareClick(square: number) {
  if (selectedSquare === null) {
    selectSquare(square);
  } else if (selectedSquare != null) {
    clearHighlights(squareDivs);

    const moves = generateAllMoves(pos);
    const toSquareMoves = moves.filter(
      (m) => getMoveFrom(m) === selectedSquare && getMoveTo(m) === square,
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
          promotionPiece.src = pieces[pos.sideToMove][getMovePromotionPiece(m)];
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
}

function sendMove(move: Move) {
  selectedSquare = null;

  worker.postMessage({ type: "move", move: moveToNotation(move) });

  const newPos = makeLegalMove(pos, move);
  playMoveSound(move, newPos!);

  worker.postMessage({ type: "getBoard" });

  worker.postMessage({ type: "go", movetime });
}

// Select and highlight legal moves on the board
function selectSquare(square: number) {
  selectedSquare = square;

  const moves = generateAllMoves(pos);
  const fromSquareMoves = moves.filter((m) => getMoveFrom(m) === square);

  const legalMoves = fromSquareMoves.filter(
    (m) => makeLegalMove(pos, m) != null,
  );

  highlightSquares(
    squareDivs,
    legalMoves.map((m) => getMoveTo(m)),
  );
}

// Settings panel
const sideOptions =
  document.querySelectorAll<HTMLButtonElement>(".side-option");

sideOptions.forEach((option) => {
  option.addEventListener("click", () => {
    sideOptions.forEach((other) => {
      other.classList.remove("is-selected");
      other.setAttribute("aria-pressed", "false");
    });

    option.classList.add("is-selected");
    option.setAttribute("aria-pressed", "true");

    selectedSide = option.dataset.side === "black" ? Color.Black : Color.White;
  });
});

const startGameButton = document.getElementById("start-game");
startGameButton?.addEventListener("click", () => {
  const fenInput = document.getElementById("fen-input");
  const movetimeInput = document.getElementById("movetime-input");

  const fen = fenInput instanceof HTMLInputElement ? fenInput.value.trim() : "";
  const parsedMovetime =
    movetimeInput instanceof HTMLInputElement
      ? Number(movetimeInput.value)
      : Number.NaN;

  movetime =
    Number.isFinite(parsedMovetime) && parsedMovetime > 0
      ? parsedMovetime
      : 1000;

  moveList.length = 0;
  selectedSquare = null;
  resetEngineInfo();

  worker.postMessage({ type: "newGame", fen });
  worker.postMessage({ type: "getBoard" });

  if (selectedSide === Color.Black) {
    worker.postMessage({ type: "go", movetime });
  }
});
