import "../scss/main.scss";
import fontRegular from "../assets/fonts/tthoves-regular.woff2?url";
import fontMedium from "../assets/fonts/tthoves-medium.woff2?url";

[fontRegular, fontMedium].forEach((href) => {
  const l = document.createElement("link");
  l.rel = "preload";
  l.as = "font";
  l.href = href;
  l.type = "font/woff2";
  l.crossOrigin = "anonymous";
  document.head.appendChild(l);
});

document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener("click", (e) => e.preventDefault());
});

import { loadPartials } from "./includes.js";
import { initBurger } from "../js/modules/burger-button.js";
import { initScrollToTop } from "../js/modules/scroll-to-top.js";
import { initDragSliders } from "../js/modules/drag-slider.js";
import { initForm } from "../js/modules/form.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadPartials();

  initBurger();
  initScrollToTop();
  initDragSliders();
  initForm();
});
