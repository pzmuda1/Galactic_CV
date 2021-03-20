import { BehaviorSubject } from "rxjs";
import { shipAngle } from "../ship/shipManager";
import { getCosFromDegrees, getSinFromDegrees, appendToEl } from "../utils";
import { velocity$ } from "../velocityManager";
import "./board.scss";
import board from "./board.html";

// in vw and vh
export const BOARD_SIZE = 3;
const BOARD_SIZE_MULITPLIER = 0.0015;

appendToEl(board);
export const boardElement = document.getElementById("board");

export const boardPosition = new BehaviorSubject({
  top: -1.5,
  left: -1,
});

velocity$.subscribe(([val]) => {
  let angle = shipAngle.value % 360;
  angle = angle > 0 ? angle : angle + 360;
  const xVelocity = getCosFromDegrees(shipAngle.value) * val;
  const yVelocity = getSinFromDegrees(shipAngle.value) * val;

  boardPosition.next({
    left: Math.min(
      Math.max(
        (-BOARD_SIZE + 1),
        boardPosition.value.left - xVelocity * BOARD_SIZE_MULITPLIER
      ),
      0
    ),
    top: Math.min(
      Math.max(
        (-BOARD_SIZE + 1),
        boardPosition.value.top - yVelocity * BOARD_SIZE_MULITPLIER
      ),
      0
    ),
  });
});

boardPosition.subscribe(({ left, top }) => {
  window.requestAnimationFrame(() => {
    boardElement.style.transform = `translateX(${left * 100}vw) translateY(${top * 100}vh)`;
  });
});
