import { sanitize, addHook } from "dompurify";
import { fromEvent, Subject, timer } from "rxjs";
import { filter, takeUntil, take, tap } from "rxjs/operators";

export const victory = new Subject();

export function getSinFromDegrees(degrees: number) {
  return Math.sin((degrees * Math.PI) / 180);
}

export function getCosFromDegrees(degrees: number) {
  return Math.cos((degrees * Math.PI) / 180);
}

export const controlsOverlay = document.getElementById("controls-overlay");
export const modalsOverlay = document.getElementById("modals-overlay");

export const listenToKey = (
  keyCodes: string[],
  {
    constant,
    onEnd,
    onStart,
    constantInterval,
  }: {
    onStart?: () => void;
    constant?: () => void;
    constantInterval?: number;
    onEnd?: () => void;
  }
) => {
  return fromEvent(document, "keydown")
    .pipe(
      filter((e: KeyboardEvent) => keyCodes.includes(e.code) && !e.repeat),
      takeUntil(victory)
    )
    .subscribe(() => {
      onStart && onStart();

      const onEndObs = fromEvent(document, "keyup").pipe(
        filter((e: KeyboardEvent) => keyCodes.includes(e.code)),
        take(1),
        tap(() => {
          onEnd && onEnd();
        })
      );

      if (constant) {
        timer(onStart ? 500 : 0, constantInterval ?? 10)
          .pipe(takeUntil(onEndObs))
          .subscribe(() => {
            constant();
          });
      } else {
        onEndObs.subscribe();
      }
    });
};

export const root = document.getElementById("root");

export function appendToEl(val: string, el: HTMLElement = root) {
  var template = document.createElement("template");
  val = val?.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = sanitize(`${sanitize(val)}`, { ADD_ATTR: ["target"] });

  const node = el.appendChild(template.content.firstChild);

  return node as HTMLElement;
}

addHook("afterSanitizeAttributes", function (node) {
  // set all elements owning target to target=_blank
  if ("target" in node) {
    if ((node as HTMLLinkElement).id === 'restart') {
      return;
    }

    (node as HTMLLinkElement).setAttribute("target", "_blank");
    (node as HTMLLinkElement).setAttribute("rel", "noopener");
  }
});
