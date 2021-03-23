import "./intro.scss";
import intro from "./intro.html";
import start from "./start.html";
import { appendToEl } from "../utils";

const audio = document.body.getElementsByTagName("audio")[0];

export const startOverlay = document.getElementById("start-overlay");

const startElement = appendToEl(start, startOverlay);
startElement.onclick = () => {
  startOverlay.removeChild(startElement);
  const introEl = appendToEl(intro, startOverlay);
  audio.play();
  const titles = document.getElementById("titles");

  titles.addEventListener("animationend", () => {
    startOverlay.removeChild(introEl);
    startOverlay.classList.add("fadeOut");

    const interval = setInterval(function () {
      audio.volume -= 0.1;

      if (audio.volume < 0.1) {
        clearInterval(interval);
        audio.remove();
      }
    }, 200);
  });
};
