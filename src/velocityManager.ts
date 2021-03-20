import { BehaviorSubject, combineLatest, timer } from "rxjs";
import { filter, share, takeUntil } from "rxjs/operators";
import { listenToKey } from "./utils";
import { windowSize } from "./windowSize";

const MIN_VELOCITY = 0.1;

const VELOCITY_MULTIPLIER = 1.02;

const MAX_FORWARD_VELOCITY = 1.1;
const MAX_BACKWARD_VELOCITY = -0.6;

export const velocity = new BehaviorSubject(0);
export const isAccelerating = new BehaviorSubject(false);
const isGoingBackward = new BehaviorSubject(false);

export const velocity$ = combineLatest([velocity, windowSize]).pipe(
  filter(([val]) => Math.abs(val) > MIN_VELOCITY),
  share()
);

combineLatest([isAccelerating, isGoingBackward])
  .pipe(filter(([acc, back]) => !acc && !back))
  .subscribe(() => {
    const takeUntilKeyPressOrStopped = combineLatest([
      isAccelerating,
      isGoingBackward,
      velocity,
    ]).pipe(
      filter(
        ([newAcc, newBack, velocity]) => newAcc || newBack || velocity === 0
      )
    );

    timer(0, 10)
      .pipe(takeUntil(takeUntilKeyPressOrStopped))
      .subscribe(() => {
        const newValue = velocity.value / VELOCITY_MULTIPLIER;
        velocity.next(Math.abs(newValue) > MIN_VELOCITY ? newValue : 0);
      });
  });

isAccelerating.pipe(filter((state) => state)).subscribe((state) => {
  timer(0, 10)
    .pipe(
      takeUntil(isAccelerating.pipe(filter((newState) => state !== newState)))
    )
    .subscribe(() => {
      velocity.next(
        Math.min(
          Math.max(velocity.value, MIN_VELOCITY) * VELOCITY_MULTIPLIER,
          MAX_FORWARD_VELOCITY
        )
      );
    });
});

isGoingBackward.pipe(filter((state) => state)).subscribe((state) => {
  timer(0, 10)
    .pipe(
      takeUntil(isGoingBackward.pipe(filter((newState) => state !== newState)))
    )
    .subscribe(() => {
      velocity.next(
        Math.min(
          Math.max(velocity.value, MIN_VELOCITY) * VELOCITY_MULTIPLIER,
          MAX_BACKWARD_VELOCITY
        )
      );
    });
});

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
