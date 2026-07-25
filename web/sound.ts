import { NOT_PROMOTION } from "../src/constants";
import { getMoveIsCapture, getMovePromotionPiece } from "../src/moves/move";
import { isSquareAttacked, oppositeColor } from "../src/position/board";
import type { Move, Position } from "../src/types";
import { sounds } from "./constants";

const moveAudio = new Audio(sounds.move);

const audioCache = {
  move: moveAudio,
  capture: new Audio(sounds.capture),
  check: moveAudio,
  promotion: moveAudio,
};

function playSound(audio: HTMLAudioElement): void {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function playMoveSound(move: Move, positionAfter: Position): void {
  if (getMoveIsCapture(move)) {
    playSound(audioCache.capture);
  } else if (
    isSquareAttacked(
      positionAfter,
      positionAfter.kingSquares[positionAfter.sideToMove],
      oppositeColor(positionAfter.sideToMove),
    )
  ) {
    playSound(audioCache.check);
  } else if (getMovePromotionPiece(move) !== NOT_PROMOTION) {
    playSound(audioCache.promotion);
  } else {
    playSound(audioCache.move);
  }
}
