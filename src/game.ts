import { filter, share, take } from "rxjs/operators";
import { introFinished } from "./intro/intro";

const loadElements = introFinished.pipe(
  filter((val) => val),
  take(1)
);

export const initGame = () => {
  import("./board/boardManager");

  import("./ship/shipManager").then(({ initShip }) => {
    loadElements.subscribe(() => {
      initShip();
    });
  });
  import("./targets/targets").then(({ initTargets }) => {
    loadElements.subscribe(() => {
      initTargets();
    });
  });
  import("./shoots/shoots").then(({ initShoots }) => {
    loadElements.subscribe(() => {
      initShoots();
    });
  });
  import("./enemy/enemy").then(({ addEnemy }) => {
    loadElements.subscribe(() => {
      addEnemy({ top: 50, left: 50 });
      addEnemy({ top: 300, left: 50 });
    });
  });
};
