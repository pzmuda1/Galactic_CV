import { BehaviorSubject, fromEvent } from "rxjs";
import { debounceTime, map, startWith } from "rxjs/operators";

export const isMobile = new BehaviorSubject(false);

export const windowSize = fromEvent(window, "resize").pipe(
  startWith({
    width: Math.min(1920, window.innerWidth),
    height: Math.min(1080, window.innerHeight),
  }),
  map(() => {
    const width = Math.min(1920, window.innerWidth);

    isMobile.next(width <= 768);

    return {
      width: Math.min(1920, window.innerWidth),
      height: Math.min(1080, window.innerHeight),
    };
  })
);
