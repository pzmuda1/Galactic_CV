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
  import("./planets/planets").then(({ initPlanets }) => {
    loadElements.subscribe(() => {
      initPlanets();
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

      import("./targetsList/targetsList").then(({ initTargetsList }) => {
        initTargetsList();
      });
    });
  });

  import("./mobileControls/mobileControls").then(({ initMobileControls }) => {
    loadElements.subscribe(() => {
      initMobileControls();
    });
  });
};
