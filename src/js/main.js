import "../scss/main.scss";

document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener("click", (e) => e.preventDefault());
});

import { initBurger } from "../js/modules/burger-button.js";
import { initScrollToTop } from "../js/modules/scroll-to-top.js";
import { initDragSliders } from "../js/modules/drag-slider.js";
import { initForm } from "../js/modules/form.js";
import { initPricingComparasion } from "../js/modules/pricing-comparasion.js";

document.addEventListener("DOMContentLoaded", async () => {
  initBurger();
  initScrollToTop();
  initDragSliders();
  initForm();
  initPricingComparasion();
});
