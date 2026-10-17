import { afterEach, describe, expect, test } from "bun:test";
import { kinetic } from "../src/motion/engine";
import { splitText } from "../src/motion/split";

function el(html: string): HTMLElement {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("splitText", () => {
  test("chars mode wraps every non-space char", () => {
    const node = el("<p>Go big</p>");
    const result = splitText(node, { mode: "chars" });
    expect(node.querySelectorAll(".ct-char").length).toBe(6);
    expect(result.chars.every((c) => c.dataset.ct === "char")).toBe(true);
  });

  test("spaces become nbsp spans, not chars", () => {
    const node = el("<p>a b</p>");
    const result = splitText(node, { mode: "chars" });
    const spaces = node.querySelectorAll<HTMLElement>('[data-space="true"]');
    expect(spaces.length).toBe(1);
    expect(result.chars.some((c) => c.textContent === " ")).toBe(false);
  });

  test("words mode splits on whitespace", () => {
    const node = el("<p>one two three</p>");
    const result = splitText(node, { mode: "words" });
    expect(result.words.length).toBe(3);
    expect(result.words.map((w) => w.textContent)).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  test("lines mode preserves newline structure", () => {
    const node = el("<p>line one\nline two</p>");
    const result = splitText(node, { mode: "lines" });
    expect(result.lines.length).toBe(2);
    expect(result.lines.map((l) => l.textContent)).toEqual([
      "line one",
      "line two",
    ]);
  });

  test("chars-words groups chars inside word wrappers", () => {
    const node = el("<p>hey you</p>");
    const result = splitText(node, { mode: "chars-words" });
    expect(result.words.length).toBe(2);
    expect(result.words[0]!.querySelectorAll(".ct-char").length).toBe(3);
    // every char lives inside a word wrapper
    const orphans = result.chars.filter(
      (c) => !result.words.some((w) => w.contains(c)),
    );
    expect(orphans.length).toBe(0);
  });

  test("revert restores original html and a11y attributes", () => {
    const node = el("<p>brand line</p>");
    const original = node.innerHTML;
    const result = splitText(node, { mode: "chars" });
    expect(node.getAttribute("aria-label")).toBe("brand line");
    result.revert();
    expect(node.innerHTML).toBe(original);
    expect(node.getAttribute("aria-label")).toBeNull();
    expect(node.dataset.ctSplit).toBeUndefined();
  });

  test("aria-label keeps full text for screen readers", () => {
    const node = el("<p>hidden&nbsp;meaning</p>");
    splitText(node, { mode: "chars" });
    expect(node.getAttribute("aria-label")).toBe("hidden\u00A0meaning");
    const hidden = node.querySelectorAll<HTMLElement>("[aria-hidden]");
    expect(hidden.length).toBeGreaterThan(0);
  });

  test("multi-line content produces one line wrapper per newline", () => {
    const node = el("<p>top\nmid\nbottom</p>");
    const result = splitText(node, { mode: "words" });
    expect(result.lines.length).toBe(3);
    expect(result.words.length).toBe(3);
    expect(result.words.map((w) => w.textContent)).toEqual([
      "top",
      "mid",
      "bottom",
    ]);
  });
});

describe("kinetic controller", () => {
  test("preset engine creates and destroys cleanly", () => {
    const node = el("<h1>Hook</h1>");
    document.body.appendChild(node);
    const ctrl = kinetic(node, { preset: "fade-up", autoplay: false });
    expect(typeof ctrl.play).toBe("function");
    expect(typeof ctrl.reverse).toBe("function");
    expect(typeof ctrl.pause).toBe("function");
    expect(typeof ctrl.resume).toBe("function");
    expect(typeof ctrl.destroy).toBe("function");
    expect(ctrl.playing).toBe(false);
    ctrl.play();
    ctrl.pause();
    ctrl.destroy();
  });

  test("destroy is idempotent", () => {
    const node = el("<h1>Hook</h1>");
    document.body.appendChild(node);
    const ctrl = kinetic(node, { preset: "pop", autoplay: false });
    ctrl.destroy();
    expect(() => ctrl.destroy()).not.toThrow();
  });
});
