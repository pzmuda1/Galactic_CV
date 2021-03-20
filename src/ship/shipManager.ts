import { BehaviorSubject, combineLatest } from "rxjs";
import { debounceTime, filter, throttleTime } from "rxjs/operators";
import {
  appendToEl,
  getCosFromDegrees,
  getSinFromDegrees,
  listenToKey,
} from "../utils";
import { velocity$, velocity, isAccelerating } from "../velocityManager";
import "./x-wing.scss";
import html from "./ship.html";
import { accelerateSound, stopAccelerateSound } from "./accelerateSound";
import { boardPosition, BOARD_SIZE } from "../board/boardManager";

appendToEl(html);
const shipElement = document.getElementById("ship");
const xWingElement = document.getElementById("x-wing");

const MAX_Y = 120;
const MAX_X = 120;

const SCREEN_PADDING = 50;

export const shipPosition = new BehaviorSubject({
  top: 0,
  left: 0,
});
export const shipAngle = new BehaviorSubject(-45);

const turnLeft = () => {
  shipAngle.next(shipAngle.value + 1 * (velocity.value >= 0 ? -1 : 1));
};

const turnRight = () => {
  shipAngle.next(shipAngle.value + 1 * (velocity.value >= 0 ? 1 : -1));
};

velocity$.subscribe(([val, { height, width }]) => {
  let angle = shipAngle.value % 360;
  angle = angle > 0 ? angle : angle + 360;
  const xVelocity = getCosFromDegrees(shipAngle.value) * val;
  const yVelocity = getSinFromDegrees(shipAngle.value) * val;

  const { top: boardTop, left: boardLeft } = boardPosition.value;
  const { top: shipTop, left: shipLeft } = shipPosition.value;
  const left = shipPosition.value.left + xVelocity;
  const top = shipPosition.value.top + yVelocity;
  if (
    (Math.abs(left) < MAX_X && Math.abs(top) < MAX_Y) ||
    boardLeft === 0 ||
    boardTop === 0 ||
    -boardLeft === BOARD_SIZE - 1 ||
    -boardTop === BOARD_SIZE - 1 ||
    Math.abs(shipTop) > MAX_Y ||
    Math.abs(shipLeft) > MAX_X
  ) {
    shipPosition.next({
      left: Math.min(Math.max(left, -0.5 * width + SCREEN_PADDING), 0.5 * width - SCREEN_PADDING),
      top: Math.min(Math.max(top, -0.5 * height + SCREEN_PADDING), 0.5 * height - SCREEN_PADDING),
    });
  }
});

isAccelerating.subscribe((state) => {
  if (state) {
    accelerateSound();
    shipElement.classList.add("accelerating");
  } else {
    shipElement.classList.remove("accelerating");
    stopAccelerateSound();
  }
});

listenToKey("ArrowLeft", {
  constant: () => {
    turnLeft();
  },
});

listenToKey("ArrowRight", {
  constant: () => {
    turnRight();
  },
});

combineLatest([shipPosition, shipAngle])
  .pipe(throttleTime(10))
  .subscribe(([{ left, top }, angle]) => {
    window.requestAnimationFrame(() => {
      shipElement.style.transform = `translateX(${left}px) translateY(${top}px)`;
      xWingElement.style.transform = `rotateX(-30deg) rotateY(${
        90 - angle
      }deg)`;
    });
  });
