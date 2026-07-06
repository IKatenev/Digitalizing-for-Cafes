export function initBurger() {
  const burgerBtn = document.getElementById("burger-btn");
  const overlay = document.getElementById("overlay");

  if (!burgerBtn) {
    return;
  }

  const closeMenu = () => {
    burgerBtn.setAttribute("aria-expanded", "false");
    burgerBtn.setAttribute("aria-label", "Открыть меню");
    burgerBtn.setAttribute("title", "Открыть меню");
    burgerBtn.classList.remove("is-active");
    overlay?.classList.remove("is-active");
  };

  const toggleMenu = () => {
    const isExpanded = burgerBtn.getAttribute("aria-expanded") === "true";
    burgerBtn.setAttribute("aria-expanded", !isExpanded);

    if (!isExpanded) {
      burgerBtn.setAttribute("aria-label", "Закрыть меню");
      burgerBtn.setAttribute("title", "Закрыть меню");
    } else {
      burgerBtn.setAttribute("aria-label", "Открыть меню");
      burgerBtn.setAttribute("title", "Открыть меню");
    }

    burgerBtn.classList.toggle("is-active");
    overlay?.classList.toggle("is-active");
  };

  burgerBtn.addEventListener("click", toggleMenu);

  document.addEventListener("click", (e) => {
    if (overlay?.classList.contains("is-active")) {
      const isClickInside = overlay.contains(e.target) || burgerBtn.contains(e.target);
      if (!isClickInside) {
        closeMenu();
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay?.classList.contains("is-active")) {
      closeMenu();
    }
  });
}
