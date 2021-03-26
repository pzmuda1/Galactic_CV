import { BehaviorSubject, combineLatest } from "rxjs";
import { distinctUntilChanged, pairwise } from "rxjs/operators";
import { boardElement, boardPosition } from "../board/boardManager";
import { shipPosition } from "../ship/shipManager";
import { windowSize } from "../windowSize";
import { appendToEl, listenToKey, modalsOverlay } from "../utils";
import "./targets.scss";
import "./modal.scss";

import fun from "./fun.html";
import about from "./about.html";
import resume from "./resume.html";
import skills from "./skills.html";

export const activePlanet = new BehaviorSubject(null);

export const visitedPlanets = new BehaviorSubject([]);

export const modalId = new BehaviorSubject(null);

export const planets = [
  {
    left: 1.5,
    top: 0.4,
    el: null as HTMLElement,
    html: `<div><div class='target1'></div><div>`,
    modal: about,
  },
  {
    left: 0.7,
    top: 0.2,
    el: null as HTMLElement,
    html: `<div><div class='target2'></div><div>`,
    modal: resume,
  },
  {
    left: 1.3,
    top: 1.5,
    el: null as HTMLElement,
    html: `<div><div class='target3'></div><div>`,
    modal: skills,
  },
  {
    left: 0.5,
    top: 1.1,
    el: null as HTMLElement,
    html: `<div><div class='target4'></div><div>`,
    modal: fun,
  },
];

export const initPlanets = () => {
  planets.forEach(({ html, left, top }, index) => {
    const targetEl = appendToEl(html, boardElement);
    targetEl.style.left = `${left * 100}vw`;
    targetEl.style.top = `${top * 100}vh`;
    targetEl.classList.add("target");
    targetEl.id = "target_" + index;

    planets[index].el = targetEl;
    boardElement.appendChild(targetEl);
  });

  combineLatest([shipPosition, boardPosition, windowSize]).subscribe(
    ([
      { top: shipTop, left: shipLeft },
      { top: boardTop, left: boardLeft },
      { height, width },
    ]) => {
      planets.forEach(({ el, left, top }, index) => {
        el.style.left = `${left * width}px`;
        el.style.top = `${top * height}px`;
        const distanceXFromCenter = (left - 0.5) * width;
        const distanceYFromCenter = (top - 0.5) * height;

        const isMobile = width <= 768;
        const activePadding = isMobile ? 75 : 150;

        if (
          Math.abs(distanceYFromCenter - shipTop + boardTop * height) <
            activePadding &&
          Math.abs(distanceXFromCenter - shipLeft + boardLeft * width) <
            activePadding
        ) {
          activePlanet.next(index);
        } else if (activePlanet.value === index) {
          activePlanet.next(null);
        }
      });
    }
  );

  activePlanet
    .pipe(distinctUntilChanged(), pairwise())
    .subscribe(([past, current]) => {
      if (modalId.value !== null) {
        return;
      }

      if (past !== null) {
        const el = document.getElementById("target_" + past);
        el.classList.remove("active");
      }

      if (current !== null) {
        const el = document.getElementById("target_" + current);
        el.classList.add("active");
      }
    });

  listenToKey(["Space"], {
    onStart: () => {
      const index = activePlanet.value;
      if (index !== null) {
        const active = planets[index];
        const visitedPlanetsIds = visitedPlanets.value;

        if (modalId.value !== null) {
          return;
        }

        modalId.next(index);
        const modal = appendToEl(active.modal, modalsOverlay);
        modalsOverlay.classList.add("fadeIn");
        modalsOverlay.classList.remove("fadeOut");

        const closeEl = modal.getElementsByClassName("close")[0] as HTMLElement;
        closeEl.onclick = () => {
          modalsOverlay.classList.add("fadeOut");
          const removeModal = () => {
            modalsOverlay.removeChild(modal);
            modalsOverlay.removeEventListener("transitionend", removeModal);
            modalId.next(null);

            if (!visitedPlanetsIds.includes(index)) {
              visitedPlanets.next([...visitedPlanetsIds, index]);
            }
          };

          modalsOverlay.addEventListener("transitionend", removeModal);
        };
      }
    },
  });
};
