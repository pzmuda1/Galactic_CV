import { sanitize } from "dompurify";
import { fromEvent, timer } from "rxjs";
import { filter, takeUntil, take, tap } from "rxjs/operators";

export function getSinFromDegrees(degrees: number) {
  return Math.sin((degrees * Math.PI) / 180);
}

export function getCosFromDegrees(degrees: number) {
  return Math.cos((degrees * Math.PI) / 180);
}

export const listenToKey = (
  keyCode: string,
  {
    constant,
    onEnd,
    onStart,
  }: {
    onStart?: () => void;
    constant?: () => void;
    onEnd?: () => void;
  }
) => {
  return fromEvent(document, "keydown")
    .pipe(filter((e: KeyboardEvent) => e.code === keyCode && !e.repeat))
    .subscribe(() => {
      onStart && onStart();

      const onEndObs = fromEvent(document, "keyup").pipe(
        filter((e: KeyboardEvent) => e.code === keyCode),
        take(1),
        tap(() => {
          onEnd && onEnd();
        })
      );

      if (constant) {
        timer(0, 10)
          .pipe(takeUntil(onEndObs))
          .subscribe(() => {
            constant();
          });
      } else {
        onEndObs.subscribe();
      }
    });
};

const root = document.getElementById("root");
export function appendToRoot(val: string) {
  var template = document.createElement("template");
  val = val?.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = sanitize(`<div>${sanitize(val)}</div>`);

  root.appendChild(template.content.firstChild);

  return template.content.firstChild;
}
