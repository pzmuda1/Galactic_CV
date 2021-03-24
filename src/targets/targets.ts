import { BehaviorSubject, combineLatest } from "rxjs";
import { distinctUntilChanged, pairwise } from "rxjs/operators";
import { boardElement, boardPosition } from "../board/boardManager";
import { shipPosition } from "../ship/shipManager";
import { windowSize } from "../windowSize";
import { appendToEl } from "../utils";
import "./targets.scss";
import target1 from "./target1.html";
import target2 from "./target2.html";
import target3 from "./target3.html";

const activeTarget = new BehaviorSubject(null);

const targets = [
  {
    left: 0.7,
    top: 0.3,
    el: null as HTMLElement,
    html: target1,
  },
  {
    left: 1.5,
    top: 0.4,
    el: null as HTMLElement,
    html: target2,
  },
  {
    left: 1.3,
    top: 1.5,
    el: null as HTMLElement,
    html: target3,
  },
];

export const initTargets = () => {
  targets.forEach(({ html, left, top }, index) => {
    const targetEl = appendToEl(html, boardElement);
    targetEl.style.left = `${left * 100}vw`;
    targetEl.style.top = `${top * 100}vh`;
    targetEl.classList.add("target");
    targetEl.id = "target_" + index;

    targets[index].el = targetEl;
    boardElement.appendChild(targetEl);
  });

  combineLatest([shipPosition, boardPosition, windowSize]).subscribe(
    ([
      { top: shipTop, left: shipLeft },
      { top: boardTop, left: boardLeft },
      { height, width },
    ]) => {
      targets.forEach(({ el, left, top }, index) => {
        el.style.left = `${left * width}px`;
        el.style.top = `${top * height}px`;
        const distanceXFromCenter = (left - 0.5) * width;
        const distanceYFromCenter = (top - 0.5) * height;
        if (
          Math.abs(distanceYFromCenter - shipTop + boardTop * height) < 100 &&
          Math.abs(distanceXFromCenter - shipLeft + boardLeft * width) < 100
        ) {
          activeTarget.next(index);
        } else if (activeTarget.value === index) {
          activeTarget.next(null);
        }
      });
    }
  );

  activeTarget
    .pipe(distinctUntilChanged(), pairwise())
    .subscribe(([past, current]) => {
      if (past !== null) {
        const el = document.getElementById("target_" + past);
        el.classList.remove("active");
      }

      if (current !== null) {
        const el = document.getElementById("target_" + current);
        el.classList.add("active");
      }
    });
};
