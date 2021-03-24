import { BehaviorSubject, combineLatest, timer } from "rxjs";
import { filter, map, share, switchMap, takeUntil } from "rxjs/operators";
import { listenToKey } from "./utils";
import { windowSize } from "./windowSize";

const FORWARD_VELOCITY = 3;
const BACKWARD_VELOCITY = -1.5;

export const isAccelerating = new BehaviorSubject(false);
export const isGoingBackward = new BehaviorSubject(false);

export const velocity$ = timer(0, 10).pipe(
  switchMap(() => {
    return combineLatest([isAccelerating, isGoingBackward, windowSize]).pipe(
      map(
        ([acc, back, windowSize]) =>
          [
            acc ? FORWARD_VELOCITY : back ? BACKWARD_VELOCITY : 0,
            windowSize,
          ] as const
      )
    );
  })
);

listenToKey("ArrowUp", {
  onStart: () => {
    isAccelerating.next(true);
  },
  onEnd: () => {
    isAccelerating.next(false);
  },
});

listenToKey("ArrowDown", {
  onStart: () => {
    isGoingBackward.next(true);
  },
  onEnd: () => {
    isGoingBackward.next(false);
  },
});
