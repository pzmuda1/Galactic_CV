import { appendToEl, controlsOverlay } from "../utils";
import html from "./mobileControls.html";
import "./mobileControls.scss";

const arrowsKeyCodes = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space"];

export const initMobileControls = () => {
  const controls = appendToEl(html, controlsOverlay);

  arrowsKeyCodes.forEach((code) => {
    const arrow = controls.getElementsByClassName(code)[0] as HTMLDivElement;

    arrow.ontouchstart = () => {
      const event = new KeyboardEvent("keydown", { code });
      document.dispatchEvent(event);
    };

    arrow.ontouchend = () => {
      const event = new KeyboardEvent("keyup", { code });
      document.dispatchEvent(event);
    };
  });
};
