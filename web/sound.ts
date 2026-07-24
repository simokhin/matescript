import { NOT_PROMOTION } from "../src/constants";
import { getMoveIsCapture, getMovePromotionPiece } from "../src/moves/move";
import { isSquareAttacked, oppositeColor } from "../src/position/board";
import type { Move, Position } from "../src/types";
import { sounds } from "./constants";

const audioCache = {
  move: new Audio(sounds.move),
  capture: new Audio(sounds.capture),
  check: new Audio(sounds.check),
  promotion: new Audio(sounds.promotion),
};

export function playMoveSound(move: Move, positionAfter: Position): void {
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
