export function initPricingComparasion(selector = ".pricing-comparasion") {
  const root = document.querySelector(selector);
  if (!root) {
    return null;
  }

  const tabs = root.querySelectorAll("[data-tab]");
  const columns = root.querySelectorAll("[data-column]");

  if (!tabs.length || !columns.length) {
    return null;
  }

  const setActiveTab = (tabName) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === tabName;
      tab.classList.toggle("pricing-comparasion__tab--active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    columns.forEach((column) => {
      column.classList.toggle(
        "pricing-comparasion__column--active",
        column.dataset.column === tabName,
      );
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveTab(tab.dataset.tab);
    });
  });

  // Установка первой активной вкладки по умолчанию
  const activeTab = [...tabs].find((t) => t.classList.contains("pricing-comparasion__tab--active"));
  if (activeTab) {
    setActiveTab(activeTab.dataset.tab);
  }

  return { setActiveTab };
}
