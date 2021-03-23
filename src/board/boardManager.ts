import { BehaviorSubject, combineLatest } from "rxjs";
import { shipAngle } from "../ship/shipManager";
import { getCosFromDegrees, getSinFromDegrees, appendToEl, root } from "../utils";
import { velocity$ } from "../velocityManager";
import "./board.scss";
import board from "./board.html";
import { windowSize } from "../windowSize";
import { debounceTime, pairwise, startWith, throttleTime, withLatestFrom } from "rxjs/operators";

// in vw and vh
export const BOARD_SIZE = 2;
const BOARD_SIZE_MULITPLIER = 450;

appendToEl(board);
export const boardElement = document.getElementById("board");

export const boardPosition = new BehaviorSubject({
  top: -0.5,
  left: -1,
});

velocity$.pipe(throttleTime(10)).subscribe(([val, { height, width }]) => {
  let angle = shipAngle.value % 360;
  angle = angle > 0 ? angle : angle + 360;
  const xVelocity =
    (getCosFromDegrees(shipAngle.value) * val) / BOARD_SIZE_MULITPLIER;
  const yVelocity =
    (getSinFromDegrees(shipAngle.value) * val) / BOARD_SIZE_MULITPLIER;

  boardPosition.next({
    left: Math.min(
      Math.max(-BOARD_SIZE + 1, boardPosition.value.left - xVelocity),
      0
    ),
    top: Math.min(
      Math.max(-BOARD_SIZE + 1, boardPosition.value.top - yVelocity),
      0
    ),
  });
});

boardPosition
  .pipe(
    startWith(boardPosition.value),
    pairwise(),
    withLatestFrom(windowSize)
  )
  .subscribe(
    ([[{ left, top }, { left: newLeft, top: newTop }], { height, width }]) => {
      root.scrollLeft = -newLeft * width;
      root.scrollTop = -newTop * height;
    }
  );
