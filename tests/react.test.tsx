import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import {
  CinematypeProvider,
  KineticText,
  Text,
  TypedVideo,
} from "../src/react";

describe("Text", () => {
  test("applies type-scale token as inline style", () => {
    const html = renderToStaticMarkup(
      h(Text as never, { step: "base" }, "hello"),
    );
    expect(html).toContain("ct-text ct-text-base");
    expect(html).toContain("font-size");
    expect(html).toContain(">hello</");
  });

  test("renders custom tag and merges font stack", () => {
    const html = renderToStaticMarkup(
      h(Text as never, { as: "h1", font: "archivo-variable" }, "Title"),
    );
    expect(html).toContain("<h1");
    expect(html).toContain("font-family");
  });

  test("unknown font id falls back to raw name, no throw", () => {
    const html = renderToStaticMarkup(
      h(Text as never, { font: "definitely-not-a-font" }, "ok"),
    );
    expect(html).toContain("definitely-not-a-font");
  });
});

describe("KineticText", () => {
  test("renders text content and ct-kinetic class", () => {
    const html = renderToStaticMarkup(
      h(KineticText as never, { text: "Stop scrolling" }),
    );
    expect(html).toContain("ct-kinetic");
    expect(html).toContain("Stop scrolling");
    expect(html).toContain("<h2");
  });

  test("honors as prop", () => {
    const html = renderToStaticMarkup(
      h(KineticText as never, { as: "h3", text: "Hook" }),
    );
    expect(html).toContain("<h3");
  });
});

describe("TypedVideo", () => {
  test("renders video element inside wrapper", () => {
    const html = renderToStaticMarkup(
      h(TypedVideo as never, {
        src: "clip.mp4",
        cues: [],
      }),
    );
    expect(html).toContain("ct-typed-video");
    expect(html).toContain('<video');
    expect(html).toContain('src="clip.mp4"');
    expect(html).toContain("playsInline");
  });

  test("muted is default true, controls visible", () => {
    const html = renderToStaticMarkup(
      h(TypedVideo as never, { src: "clip.mp4", cues: [] }),
    );
    expect(html).toContain("muted");
    expect(html).toContain("controls");
  });
});

describe("CinematypeProvider", () => {
  test("SSR renders bootstrap wrapper in loading state", () => {
    const html = renderToStaticMarkup(
      h(CinematypeProvider as never, null, h("span", null, "inner")),
    );
    expect(html).toContain('data-cinematype="loading"');
    expect(html).toContain("inner");
  });
});
