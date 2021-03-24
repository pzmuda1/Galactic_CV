import "./index.scss";
import { startIntro } from "./intro/intro";

startIntro();

window.onload = () => {
  import("./game").then(({ initGame }) => {
    initGame();
  });
};
