import { JSDOM } from "jsdom";

import { initSite } from "../src/site.js";

const siteUrl = "https://jorenders.github.io/nova-digtal/";

const response = await fetch(siteUrl);

if (!response.ok) {
  throw new Error(`Live smoke failed to fetch ${siteUrl}: ${response.status}`);
}

const html = await response.text();
const dom = new JSDOM(html, {
  url: siteUrl,
});

class MockIntersectionObserver {
  observe(node) {
    node.classList.add("is-visible");
  }

  unobserve() {}

  disconnect() {}
}

dom.window.IntersectionObserver = MockIntersectionObserver;
dom.window.setTimeout = (callback) => {
  callback();
  return 1;
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(
  dom.window.document.querySelector('[data-i18n="hero.title"]')?.textContent?.trim().length > 0,
  "Live HTML mist statische hero-copy."
);
assert(
  dom.window.document.querySelector('[data-i18n="nav.services"]')?.textContent?.trim() ===
    "Diensten",
  "Live HTML bevat niet de verwachte NL fallback-copy."
);

initSite({
  windowObj: dom.window,
  documentObj: dom.window.document,
});

dom.window.document.querySelector('[data-language="en"]')?.click();

assert(
  dom.window.document.documentElement.lang === "en",
  "Taalwissel naar EN zette html[lang] niet correct."
);
assert(
  dom.window.document.querySelector("h1")?.textContent?.includes(
    "Websites built to feel premium"
  ),
  "Taalwissel naar EN heeft de hero-title niet aangepast."
);

console.log("Live smoke passed for", siteUrl);
