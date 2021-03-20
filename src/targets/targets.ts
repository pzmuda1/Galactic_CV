import { BehaviorSubject, combineLatest } from "rxjs";
import { distinctUntilChanged, pairwise } from "rxjs/operators";
import { boardElement, boardPosition } from "../board/boardManager";
import { shipPosition } from "../ship/shipManager";
import { windowSize } from "../windowSize";
import "./targets.scss";

const activeTarget = new BehaviorSubject(null);

const targets = [
  {
    label: "Testowy cel",
    left: 1.2,
    top: 1.2,
  },
  {
    label: "Testowy cel 2",
    left: 2,
    top: 1.4,
  },
  {
    label: "Testowy cel 3",
    left: 1.4,
    top: 2,
  },
];

targets.forEach(({ label, left, top }, index) => {
  const targetEl = document.createElement("div");
  targetEl.style.left = `${left * 100}vw`;
  targetEl.style.top = `${top * 100}vh`;
  targetEl.innerHTML = label;
  targetEl.classList.add("target");
  targetEl.id = "target_" + index;

  boardElement.appendChild(targetEl);
});

combineLatest([shipPosition, boardPosition, windowSize]).subscribe(
  ([
    { top: shipTop, left: shipLeft },
    { top: boardTop, left: boardLeft },
    { height, width },
  ]) => {
    targets.forEach(({ label, left, top }, index) => {
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
