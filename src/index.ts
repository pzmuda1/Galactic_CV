import "./index.scss";
import { startIntro } from "./intro/intro";
import "./Piotr Żmuda CV.pdf";

startIntro();

window.onload = () => {
  import("./game").then(({ initGame }) => {
    initGame();
  });
};
