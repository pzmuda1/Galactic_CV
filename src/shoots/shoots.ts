import { BehaviorSubject, timer } from "rxjs";
import {
  appendToEl,
  getCosFromDegrees,
  getSinFromDegrees,
  listenToKey,
} from "../utils";
import { shipAngle, shipPosition } from "../ship/shipManager";
import "./shoot.scss";
import html from "./shoot.html";
import produce from "immer";
import { windowSize } from "../windowSize";
import { switchMap } from "rxjs/operators";
import { boardElement, boardPosition } from "../board/boardManager";
import { sparcle } from "./explode";
import { shootSound } from "./shootSound";

export interface IShoot {
  top: number;
  left: number;
  angle: number;
  el?: HTMLDivElement;
  id: number;
}

export const shoots = new BehaviorSubject<{
  [id: number]: IShoot;
}>({});

const fire = () => {
  if (Object.keys(shoots.value).length === 10) {
    return;
  }

  windowSize.subscribe(({ height, width }) => {
    const el = appendToEl(html, boardElement);
    const { left: boardLeft, top: boardTop } = boardPosition.value;
    const { left: shipLeft, top: shipTop } = shipPosition.value;

    const id = new Date().getTime();
    const shoot: IShoot = {
      top: (-boardTop + 0.5) * height + shipTop,
      left: (-boardLeft + 0.5) * width + shipLeft,
      angle: shipAngle.value,
      el: el as HTMLDivElement,
      id,
    };

    shootSound();
    shoots.next({
      ...shoots.value,
      [id]: shoot,
    });
  });
};

shoots.subscribe((shoots) => {
  Object.values(shoots).forEach(({ angle, top, left, el }) => {
    el.style.transform = `translateX(${left}px) translateY(${top}px)`;
    const shoot = el.children[0] as HTMLDivElement;
    shoot.style.transform = `rotateX(-30deg) rotateY(${90 - angle}deg)`;
  });
});

export const onShootHit = (id: number) => {
  shoots.next(
    produce((draft) => {
      const { left, top, el } = shoots.value[id];
      boardElement.removeChild(el);
      sparcle({ top, left });
      delete draft[id];
    }, shoots.value)()
  );
};

timer(0, 25)
  .pipe(switchMap(() => windowSize))
  .subscribe(({ height, width }) => {
    shoots.next(
      produce((draft) => {
        Object.keys(draft).forEach((key) => {
          const shoot: IShoot = draft[key];

          const xVelocity = getCosFromDegrees(shoot.angle) * 20;
          const yVelocity = getSinFromDegrees(shoot.angle) * 10;

          shoot.left = shoot.left + xVelocity;
          shoot.top = shoot.top + yVelocity;

          const { left: boardLeft, top: boardTop } = boardPosition.value;
          const leftScreenRatio = shoot.left / width;
          const topScreenRatio = shoot.top / height;

          if (
            leftScreenRatio + boardLeft > 1 ||
            leftScreenRatio + boardLeft < 0 ||
            topScreenRatio + boardTop > 1 ||
            topScreenRatio + boardTop < 0
          ) {
            boardElement.removeChild(shoot.el);
            delete draft[key];
          }
        });
      }, shoots.value)()
    );
  });

export const initShoots = () => {
  listenToKey("Space", {
    onStart: () => {
      fire();
    },
    constantInterval: 500,
    constant: () => {
      fire();
    },
  });
};
