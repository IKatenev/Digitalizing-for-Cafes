export function initBurger() {
  const button = document.getElementById("burger-btn");
  const overlay = document.getElementById("overlay");
  if (!button || !overlay) {
    return;
  }
  const mobile = window.matchMedia("(width <= 90.06125rem)");
  const setOpen = (open, restoreFocus = false) => {
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    button.classList.toggle("is-active", open);
    overlay.classList.toggle("is-active", open);
    overlay.inert = mobile.matches && !open;
    if (open) {
      requestAnimationFrame(() => overlay.querySelector("a")?.focus({ preventScroll: true }));
    }
    if (restoreFocus) {
      button.focus();
    }
  };
  button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
  overlay.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setOpen(false);
    }
  });
  document.addEventListener("click", (event) => {
    if (!overlay.contains(event.target) && !button.contains(event.target)) {
      setOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (button.getAttribute("aria-expanded") !== "true") {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false, true);
    } else if (event.key === "Tab") {
      const items = [...overlay.querySelectorAll("a[href], button"), button];
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  mobile.addEventListener("change", () => setOpen(false));
  setOpen(false);
}
