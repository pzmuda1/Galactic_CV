import { fromEvent } from "rxjs";
import { debounceTime, map, startWith } from "rxjs/operators";

export const windowSize = fromEvent(window, "resize").pipe(
  startWith(null),
  map(() => ({ width: Math.min(1920, window.innerWidth), height: Math.min(1080, window.innerHeight) })),
);
