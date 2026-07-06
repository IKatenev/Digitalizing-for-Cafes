export function initScrollToTop() {
  const scrollToTopBtn = document.querySelector("#to-top");

  if (!scrollToTopBtn) {
    return;
  }

  scrollToTopBtn.addEventListener("click", () => {
    const startPosition = window.scrollY;
    const duration = 500;
    let startTime = null;

    // Ease-out quadratic function for a natural deceleration feel
    const easeOutQuad = (t) => t * (2 - t);

    const animateScroll = (currentTime) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeOutQuad(progress);

      // Calculate current scroll position
      window.scrollTo(0, startPosition * (1 - ease));

      // Continue animation if duration hasn't been reached
      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  });
}
