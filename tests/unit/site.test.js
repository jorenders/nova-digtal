import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { JSDOM } from "jsdom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyLanguage,
  getTranslationValue,
  initSite,
  languageStorageKey,
  resolveInitialLanguage,
} from "../../src/site.js";

const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

const createDom = () => {
  const dom = new JSDOM(html, {
    url: "http://127.0.0.1/",
  });

  class MockIntersectionObserver {
    observe(node) {
      node.classList.add("is-visible");
    }

    unobserve() {}

    disconnect() {}
  }

  dom.window.IntersectionObserver = MockIntersectionObserver;
  dom.window.setTimeout = vi.fn((callback) => {
    callback();
    return 1;
  });

  return dom;
};

describe("site translations", () => {
  let dom;

  beforeEach(() => {
    dom = createDom();
  });

  it("resolves nested translation keys", () => {
    expect(getTranslationValue("en", "hero.card.items.0.label")).toBe("Speed");
    expect(getTranslationValue("nl", "cta.secondaryCta")).toBe("Plan een discovery call");
  });

  it("falls back to Dutch when stored language is invalid", () => {
    dom.window.localStorage.setItem(languageStorageKey, "fr");
    expect(resolveInitialLanguage(dom.window.localStorage)).toBe("nl");
  });

  it("applies English copy and updates language button state", () => {
    applyLanguage("en", {
      documentObj: dom.window.document,
    });

    expect(dom.window.document.documentElement.lang).toBe("en");
    expect(dom.window.document.title).toBe("Nova Digital | Websites that convert");
    expect(
      dom.window.document.querySelector(".hero-copy h1")?.textContent
    ).toBe("Websites built to feel premium and perform even better.");
    expect(
      dom.window.document.querySelector('[data-language="en"]')?.getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("initializes the site and persists a language switch", () => {
    initSite({
      windowObj: dom.window,
      documentObj: dom.window.document,
    });

    dom.window.document.querySelector('[data-language="en"]')?.click();

    expect(dom.window.localStorage.getItem(languageStorageKey)).toBe("en");
    expect(dom.window.document.querySelector("body")?.classList.contains("is-translating")).toBe(
      false
    );
    expect(dom.window.document.querySelector(".reveal")?.classList.contains("is-visible")).toBe(
      true
    );
  });

  it("ships Dutch fallback copy in the static HTML", () => {
    expect(dom.window.document.documentElement.lang).toBe("nl");
    expect(dom.window.document.title).toBe("Nova Digital");
    expect(dom.window.document.querySelector(".hero-copy h1")?.textContent).toBe(
      "Websites die premium aanvoelen en nog beter presteren."
    );
    expect(dom.window.document.querySelector('[data-i18n="nav.services"]')?.textContent).toBe(
      "Diensten"
    );
    expect(
      dom.window.document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    ).toBe(
      "Nova Digital ontwerpt en bouwt premium websites die snel laden, vertrouwen opbouwen en meer kwalitatieve leads opleveren."
    );

    dom.window.document.querySelectorAll("[data-i18n]").forEach((node) => {
      expect(node.textContent?.trim().length).toBeGreaterThan(0);
    });

    dom.window.document.querySelectorAll("[data-i18n-attr]").forEach((node) => {
      const attribute = node.getAttribute("data-i18n-attr");
      expect(attribute).toBeTruthy();
      expect(node.getAttribute(attribute ?? "")?.trim().length).toBeGreaterThan(0);
    });
  });
});
