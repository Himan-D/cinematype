export type SplitMode = "chars" | "words" | "lines" | "chars-words";

export interface SplitResult {
  element: HTMLElement;
  chars: HTMLElement[];
  words: HTMLElement[];
  lines: HTMLElement[];
  originalHTML: string;
  revert: () => void;
}

export interface SplitOptions {
  mode?: SplitMode;
  /** Class on char wrappers */
  charClass?: string;
  wordClass?: string;
  lineClass?: string;
  /** aria-label on root for a11y (keeps full text) */
  ariaLabel?: boolean;
}

function wrap(text: string, className: string, index: number, kind: string): HTMLElement {
  const span = document.createElement("span");
  span.className = className;
  span.dataset.ct = kind;
  span.dataset.index = String(index);
  span.style.display = "inline-block";
  // Preserve spaces
  if (text === " ") {
    span.innerHTML = "&nbsp;";
    span.dataset.space = "true";
  } else if (text === "\n") {
    span.style.display = "block";
    span.innerHTML = "<br>";
    span.dataset.break = "true";
  } else {
    span.textContent = text;
  }
  // Prevent screen readers from spelling letter-by-letter if parent has aria-label
  span.setAttribute("aria-hidden", "true");
  return span;
}

/**
 * Split element text into animatable spans (chars / words / lines).
 * Non-destructive: call result.revert() to restore original HTML.
 */
export function splitText(element: HTMLElement, options: SplitOptions = {}): SplitResult {
  const mode = options.mode ?? "chars";
  const charClass = options.charClass ?? "ct-char";
  const wordClass = options.wordClass ?? "ct-word";
  const lineClass = options.lineClass ?? "ct-line";
  const originalHTML = element.innerHTML;
  const raw = element.textContent ?? "";

  if (options.ariaLabel !== false) {
    element.setAttribute("aria-label", raw.trim());
  }

  const chars: HTMLElement[] = [];
  const words: HTMLElement[] = [];
  const lines: HTMLElement[] = [];

  element.textContent = "";

  const lineParts = raw.split("\n");
  lineParts.forEach((lineText, lineIndex) => {
    const lineEl = document.createElement("span");
    lineEl.className = lineClass;
    lineEl.dataset.ct = "line";
    lineEl.dataset.index = String(lineIndex);
    lineEl.style.display = "block";

    if (mode === "lines") {
      lineEl.textContent = lineText || "\u00A0";
      element.appendChild(lineEl);
      lines.push(lineEl);
      return;
    }

    const wordParts = lineText.split(/(\s+)/);
    let charIndex = 0;
    let wordIndex = 0;

    wordParts.forEach((part) => {
      if (!part) return;
      const isSpace = /^\s+$/.test(part);

      if (mode === "words") {
        const w = wrap(isSpace ? " " : part, wordClass, wordIndex, "word");
        if (!isSpace) {
          words.push(w);
          wordIndex++;
        }
        lineEl.appendChild(w);
        return;
      }

      // chars or chars-words
      if (isSpace) {
        lineEl.appendChild(wrap(" ", charClass, charIndex, "char"));
        charIndex++;
        return;
      }

      const wordEl =
        mode === "chars-words"
          ? (() => {
              const w = document.createElement("span");
              w.className = wordClass;
              w.dataset.ct = "word";
              w.dataset.index = String(wordIndex);
              w.style.display = "inline-block";
              w.style.whiteSpace = "nowrap";
              words.push(w);
              wordIndex++;
              return w;
            })()
          : null;

      for (const ch of part) {
        const c = wrap(ch, charClass, charIndex, "char");
        chars.push(c);
        charIndex++;
        if (wordEl) wordEl.appendChild(c);
        else lineEl.appendChild(c);
      }
      if (wordEl) lineEl.appendChild(wordEl);
    });

    element.appendChild(lineEl);
    lines.push(lineEl);
  });

  element.dataset.ctSplit = mode;

  return {
    element,
    chars,
    words,
    lines,
    originalHTML,
    revert: () => {
      element.innerHTML = originalHTML;
      element.removeAttribute("aria-label");
      delete element.dataset.ctSplit;
    },
  };
}
