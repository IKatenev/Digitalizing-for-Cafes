export function initPricingComparasion(selector = ".pricing-comparasion") {
  const root = document.querySelector(selector);
  if (!root) {
    return;
  }
  const tabs = [...root.querySelectorAll("[data-tab]")];
  const columns = [...root.querySelectorAll("[data-column]")];
  const mobile = window.matchMedia("(width <= 63.99875rem)");
  let selected =
    tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.tab ||
    tabs[0]?.dataset.tab;
  const update = () => {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === selected;
      tab.classList.toggle("pricing-comparasion__tab--active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    columns.forEach((column) => {
      const active = column.dataset.column === selected;
      column.hidden = mobile.matches && !active;
      column.classList.toggle("pricing-comparasion__column--active", active);
      column.setAttribute("role", mobile.matches ? "tabpanel" : "region");
      column.setAttribute(
        "aria-labelledby",
        mobile.matches ? `tab-${column.dataset.column}` : `plan-${column.dataset.column}`,
      );
      column.tabIndex = mobile.matches ? 0 : -1;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      selected = tab.dataset.tab;
      update();
    });
    tab.addEventListener("keydown", (event) => {
      const keys = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index - 1 + tabs.length) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      if (!(event.key in keys)) {
        return;
      }
      event.preventDefault();
      const next = tabs[keys[event.key]];
      selected = next.dataset.tab;
      update();
      next.focus();
    });
  });
  mobile.addEventListener("change", update);
  update();
}
