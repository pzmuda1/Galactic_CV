export const initGame = () => {
  import("./ship/shipManager");
  import("./board/boardManager");
  import("./targets/targets");
  import("./shoots/shoots");
  import("./enemy/enemy").then(({ addEnemy }) => {
    addEnemy({ top: 50, left: 50 });
    addEnemy({ top: 300, left: 50 });
  });
};
