export async function loadPartials() {
  const headerContainer = document.getElementById("header");
  const footerContainer = document.getElementById("footer");

  if (headerContainer) {
    const headerRes = await fetch("/partials/header.html");
    headerContainer.innerHTML = await headerRes.text();
  }

  if (footerContainer) {
    const footerRes = await fetch("/partials/footer.html");
    footerContainer.innerHTML = await footerRes.text();
  }

  // Подсветка активного пункта меню
  highlightActiveLink();
}

function highlightActiveLink() {
  const currentPage = document.body.dataset.page;
  const links = document.querySelectorAll(".header__link[data-page]");

  links.forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add("header__link--active");
    }
  });
}
