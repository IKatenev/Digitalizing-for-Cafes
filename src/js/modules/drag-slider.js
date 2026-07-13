// src/js/modules/drag-slider.js

function createDragSlider(selector) {
  const slider = document.querySelector(selector);
  if (!slider) {
    return;
  }

  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener("pointerdown", (e) => {
    // Игнорируем правый клик и вспомогательные кнопки
    if (e.button !== 0) {
      return;
    }

    isDown = true;
    slider.classList.add(`${selector.slice(1)}--dragging`);
    slider.setPointerCapture(e.pointerId);

    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("pointerleave", () => {
    isDown = false;
    slider.classList.remove(`${selector.slice(1)}--dragging`);
  });

  slider.addEventListener("pointerup", () => {
    isDown = false;
    slider.classList.remove(`${selector.slice(1)}--dragging`);
  });

  slider.addEventListener("pointermove", (e) => {
    if (!isDown) {
      return;
    }
    e.preventDefault();

    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // Скорость скролла
    slider.scrollLeft = scrollLeft - walk;
  });
}

export function initDragSliders() {
  const sliders = [
    ".retail-types__cards",
    ".testimonials-features__cards",
    ".how-to-start__cards",
    ".acquiring__cards",
    ".plans-features__cards",
  ];

  sliders.forEach(createDragSlider);
}
