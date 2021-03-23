import "./index.scss";
import "./intro/intro";

window.onload = () => {
  import('./game').then(({initGame}) => {
    initGame();
  })
};
