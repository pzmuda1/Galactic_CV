import "./intro.scss";
import intro from "./intro.html";
import start from "./start.html";
import { appendToEl } from "../utils";
import { BehaviorSubject } from "rxjs";

const audio = document.body.getElementsByTagName("audio")[0];

export const introFinished = new BehaviorSubject(false);

export const startOverlay = document.getElementById("start-overlay");

export const startIntro = () => {
  const startElement = appendToEl(start, startOverlay);
  startElement.onclick = () => {
    startElement.style.display = "none";
    const introEl = appendToEl(intro, startOverlay);
    audio.play();
    const titles = document.getElementById("titles");

    titles.addEventListener("animationend", () => {
      startOverlay.removeChild(introEl);
      introFinished.next(true);
      setTimeout(() => {
        startOverlay.classList.add("fadeOut");
      }, 500);

      const interval = setInterval(function () {
        audio.volume -= 0.1;

        if (audio.volume < 0.1) {
          clearInterval(interval);
          audio.remove();
        }
      }, 200);
    });
  };
};
