import "./enemy.scss";
import html from "./enemy.html";
import { appendToEl, getCosFromDegrees, getSinFromDegrees } from "../utils";
import { boardElement, boardPosition } from "../board/boardManager";
import { BehaviorSubject, combineLatest, Subject, timer } from "rxjs";
import { onShootHit, shoots } from "../shoots/shoots";
import { takeUntil } from "rxjs/operators";

const ENEMY_VELOCITY = 2;

export const addEnemy = ({ top, left }: { top: number; left: number }) => {
  const enemyPosition = new BehaviorSubject({
    top,
    left,
    angle: 0,
  });
  const destroyed = new Subject();

  timer(0, 10)
    .pipe(takeUntil(destroyed))
    .subscribe(() => {
      const { top: boardTop, left: boardLeft } = boardPosition.value;

      if (boardTop < -1 || boardLeft < -0.8) {
        return;
      }

      const { angle, left, top } = enemyPosition.value;
      const xVelocity = getCosFromDegrees(angle) * ENEMY_VELOCITY;
      const yVelocity = getSinFromDegrees(angle) * ENEMY_VELOCITY;

      enemyPosition.next({
        top: top + yVelocity,
        left: left + xVelocity,
        angle: angle + 0.5,
      });
    });

  const enemyEl = appendToEl(html, boardElement);

  enemyPosition.pipe(takeUntil(destroyed)).subscribe(({ angle, left, top }) => {
    enemyEl.style.transform = `translateX(${left}px) translateY(${top}px)`;
    const enemy = enemyEl.children[0] as HTMLDivElement;
    enemy.style.transform = `rotateX(-30deg) rotateY(${90 - angle}deg)`;
  });

  combineLatest([enemyPosition, shoots])
    .pipe(takeUntil(destroyed))
    .subscribe(([{ top: enemyTop, left: enemyLeft }, shoots]) => {
      Object.values(shoots).forEach(({ top, left, id }) => {
        if (Math.abs(enemyTop - top) < 20 && Math.abs(enemyLeft - left) < 20) {
          destroyed.next(true);
          boardElement.removeChild(enemyEl);
          onShootHit(id);
        }
      });
    });
};
