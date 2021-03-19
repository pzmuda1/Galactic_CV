import { BehaviorSubject, combineLatest } from "rxjs";
import { debounceTime, filter, throttleTime } from "rxjs/operators";
import {
  appendToRoot,
  getCosFromDegrees,
  getSinFromDegrees,
  listenToKey,
} from "../utils";
import { velocity$, velocity } from "../velocityManager";
import "./x-wing.css";
import html from "./ship.html";

appendToRoot(html);
const shipElement = document.getElementById("ship");
const xWingElement = document.getElementById("x-wing");

const MAX_Y = 120;
const MAX_X = 120;

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

velocity$.subscribe(([val]) => {
  let angle = shipAngle.value % 360;
  angle = angle > 0 ? angle : angle + 360;
  const xVelocity = getCosFromDegrees(shipAngle.value) * val;
  const yVelocity = getSinFromDegrees(shipAngle.value) * val;

  const left = shipPosition.value.left + xVelocity;
  const top = shipPosition.value.top + yVelocity;
  if (Math.abs(left) < MAX_X && Math.abs(top) < MAX_Y) {
    shipPosition.next({
      left,
      top,
    });
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
