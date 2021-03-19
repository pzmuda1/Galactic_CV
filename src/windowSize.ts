import { fromEvent } from "rxjs";
import { debounceTime, map, startWith } from "rxjs/operators";

export const windowSize = fromEvent(window, "resize").pipe(
  startWith(null),
  map(() => ({ width: window.innerWidth, height: window.innerHeight }))
);
