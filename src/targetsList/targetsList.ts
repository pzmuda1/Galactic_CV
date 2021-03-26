import { combineLatest, Subject } from "rxjs";
import { filter, map, startWith, take, tap } from "rxjs/operators";
import { EnemiesAliveCounter } from "../enemy/enemy";
import { planets, visitedPlanets } from "../planets/planets";
import { appendToEl, controlsOverlay, modalsOverlay, victory } from "../utils";
import html from "./targetsList.html";
import victoryHtml from "./victory.html";
import "./targetsList.scss";

const enemiesDefated = EnemiesAliveCounter.pipe(
  filter((counter) => !counter),
  map(() => true)
);

const targetsList = [
  {
    label: "Visit About me planet",
    doneListener: () => {
      return visitedPlanets.pipe(
        filter((ids) => ids.includes(0)),
        map(() => true)
      );
    },
  },
  {
    label: "Find contact on Resume planet",
    doneListener: () => {
      return visitedPlanets.pipe(
        filter((ids) => ids.includes(1)),
        map(() => true)
      );
    },
  },
  {
    label: "Check my technologies on Skills planet",
    doneListener: () => {
      return visitedPlanets.pipe(
        filter((ids) => ids.includes(2)),
        map(() => true)
      );
    },
  },
  {
    label: "Find out my hobbies on Fun planet",
    doneListener: () => {
      return visitedPlanets.pipe(
        filter((ids) => ids.includes(3)),
        map(() => true)
      );
    },
  },
  {
    label: "Destroy Imperial Bugs in North West of system",
    doneListener: () => {
      return enemiesDefated;
    },
  },
];

export const initTargetsList = () => {
  const targetsEl = appendToEl(html, controlsOverlay);

  const minimize = targetsEl.getElementsByClassName("minimize")[0];
  const maximize = targetsEl.getElementsByClassName("maximize")[0];
  const list = targetsEl.getElementsByClassName("targetsList")[0];

  minimize.addEventListener("click", () => {
    targetsEl.classList.add("minimized");
  });

  maximize.addEventListener("click", () => {
    targetsEl.classList.remove("minimized");
  });

  targetsList.forEach(({ label, doneListener }) => {
    const targetEl = appendToEl(`<li>${label}</li>`, list as HTMLElement);

    doneListener()
      .pipe(take(1))
      .subscribe(() => {
        targetEl.classList.add("done");
      });
  });

  const allPlanetsVisited = visitedPlanets.pipe(
    map((ids) => {
      return ids.length === planets.length;
    })
  );

  combineLatest([enemiesDefated, allPlanetsVisited])
    .pipe(filter(([defated, visited]) => defated && visited))
    .subscribe(() => {
      victory.next(true);
      modalsOverlay.innerHTML = "";
      appendToEl(victoryHtml, modalsOverlay);
      modalsOverlay.classList.add("fadeIn");
      modalsOverlay.classList.remove("fadeOut");
    });
};
