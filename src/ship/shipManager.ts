import { BehaviorSubject, combineLatest } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  take,
  throttleTime,
} from "rxjs/operators";
import {
  appendToEl,
  getCosFromDegrees,
  getSinFromDegrees,
  listenToKey,
} from "../utils";
import { velocity$, isGoingBackward, isAccelerating } from "../velocityManager";
import "./x-wing.scss";
import html from "./ship.html";
import { accelerateSound, stopAccelerateSound } from "./accelerateSound";
import {
  boardPosition,
  BOARD_SIZE_X,
  BOARD_SIZE_Y,
} from "../board/boardManager";

const shipElement = appendToEl(html, document.body);
const xWingElement = document.getElementById("x-wing");
const instructionsElement = document.getElementById("instructions");

const MAX_Y = 175;
const MAX_X = 175;

const SCREEN_PADDING = 100;

export const shipPosition = new BehaviorSubject({
  top: 0,
  left: 0,
});
export const shipAngle = new BehaviorSubject(-45);
export const shipMoved = new BehaviorSubject(false);

const turnLeft = () => {
  shipAngle.next(shipAngle.value + 1.5 * (isGoingBackward.value ? 1 : -1));
};

const turnRight = () => {
  shipAngle.next(shipAngle.value + 1.5 * (isGoingBackward.value ? -1 : 1));
};

shipMoved
  .pipe(
    filter((val) => val),
    take(1)
  )
  .subscribe(() => {
    instructionsElement.classList.add("fadeOut");
    instructionsElement.addEventListener("transitionend", () => {
      shipElement.removeChild(instructionsElement);
    });
  });

export const initShip = () => {
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
      -boardLeft === BOARD_SIZE_X() - 1 ||
      -boardTop === BOARD_SIZE_Y - 1 ||
      Math.abs(shipTop) > MAX_Y ||
      Math.abs(shipLeft) > MAX_X
    ) {
      shipPosition.next({
        left: Math.min(
          Math.max(left, -0.5 * width + SCREEN_PADDING),
          0.5 * width - SCREEN_PADDING
        ),
        top: Math.min(
          Math.max(top, -0.5 * height + SCREEN_PADDING),
          0.5 * height - SCREEN_PADDING
        ),
      });
    }
  });

  isAccelerating.pipe(distinctUntilChanged()).subscribe((state) => {
    if (state) {
      shipMoved.next(true);
      accelerateSound();
      shipElement.classList.add("accelerating");
    } else {
      shipElement.classList.remove("accelerating");
      stopAccelerateSound();
    }
  });

  listenToKey(["ArrowLeft", "KeyA"], {
    constant: () => {
      turnLeft();
    },
  });

  listenToKey(["ArrowRight", "KeyD"], {
    constant: () => {
      turnRight();
    },
  });

  combineLatest([shipPosition, shipAngle]).subscribe(
    ([{ left, top }, angle]) => {
      shipElement.style.transform = `translateX(${left}px) translateY(${top}px)`;
      xWingElement.style.transform = `rotateX(-30deg) rotateY(${
        90 - angle
      }deg)`;
    }
  );
};
