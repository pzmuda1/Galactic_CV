import "./index.scss";

import "./ship/shipManager";
import "./board/boardManager";
import "./targets/targets";
import "./shoots/shoots";
import { addEnemy } from "./enemy/enemy";

addEnemy({top: 50, left: 50});
addEnemy({top: 300, left: 50});
addEnemy({top: 300, left: 250});
