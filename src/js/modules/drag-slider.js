function createDragSlider(selector, label) {
  const slider = document.querySelector(selector);
  if (!slider) {
    return;
  }
  let startX;
  let scrollLeft;
  let dragging = false;
  const stop = () => {
    dragging = false;
    slider.classList.remove(`${selector.slice(1)}--dragging`);
  };
  const update = () => {
    const scrollable = slider.scrollWidth > slider.clientWidth + 1;
    slider.tabIndex = scrollable ? 0 : -1;
    slider.setAttribute("role", "region");
    slider.setAttribute("aria-label", label);
  };
  new ResizeObserver(update).observe(slider);
  slider.addEventListener("pointerdown", (event) => {
    if (
      event.button !== 0 ||
      event.pointerType !== "mouse" ||
      event.target.closest("a, button, input")
    ) {
      return;
    }
    dragging = true;
    startX = event.clientX;
    scrollLeft = slider.scrollLeft;
    slider.setPointerCapture(event.pointerId);
    slider.classList.add(`${selector.slice(1)}--dragging`);
  });
  slider.addEventListener("pointerup", stop);
  slider.addEventListener("pointercancel", stop);
  slider.addEventListener("lostpointercapture", stop);
  slider.addEventListener("pointermove", (event) => {
    if (!dragging) {
      return;
    }
    event.preventDefault();
    slider.scrollLeft = scrollLeft - (event.clientX - startX);
  });
  slider.addEventListener("keydown", (event) => {
    if (event.target !== slider || !["ArrowLeft", "ArrowRight"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    slider.scrollBy({
      left: slider.clientWidth * (event.key === "ArrowRight" ? 0.8 : -0.8),
      behavior: "instant",
    });
  });
}

export function initDragSliders() {
  const sliders = [
    [".retail-types__cards", "Business types"],
    [".testimonials-features__cards", "Why choose Absolut POS"],
    [".how-to-start__cards", "Getting started"],
    [".acquiring__cards", "Payment options"],
    [".plans-features__cards", "Included features"],
  ];
  sliders.forEach(([selector, label]) => createDragSlider(selector, label));
}
