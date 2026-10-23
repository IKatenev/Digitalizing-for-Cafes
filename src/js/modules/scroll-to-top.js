export function initScrollToTop() {
  document.querySelector("#to-top")?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    document.querySelector("#main")?.focus({ preventScroll: true });
  });
}
