import { test, expect } from "@playwright/test";

const pages = ["index.html", "pricing.html", "plans.html"];

test.beforeEach(async ({ page }) => {
  await page.route("**/enquiry", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true, message: "Your enquiry has been sent." }),
    }),
  );
});

for (const file of pages) {
  test(`${file}: production assets, metadata, navigation and demo form`, async ({
    page,
    request,
  }) => {
    const errors = [];
    const posts = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (req) => {
      if (req.method() === "POST") {
        posts.push(req.url());
      }
    });
    await page.goto(file);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveCSS("font-weight", "500");
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        img.loading = "eager";
      });
      await Promise.all([document.fonts.ready, ...[...document.images].map((img) => img.decode())]);
    });
    expect(
      await page.evaluate(() =>
        [...document.fonts]
          .filter((font) => font.status === "loaded" && font.family.includes("TT Hoves"))
          .map((font) => font.weight),
      ),
    ).toEqual(expect.arrayContaining(["400", "500"]));
    const fontUrls = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((name) => name.includes("woff2")),
    );
    expect(fontUrls.length).toBeGreaterThanOrEqual(2);
    for (const url of fontUrls) {
      const response = await request.get(url);
      expect(response.ok()).toBe(true);
      expect(response.headers()["content-type"]).toContain("font/woff2");
    }
    const expectedPath =
      file === "index.html" ? "/Digitalizing-for-Cafes/" : `/Digitalizing-for-Cafes/${file}`;
    expect(new URL(await page.locator('link[rel="canonical"]').getAttribute("href")).pathname).toBe(
      expectedPath,
    );
    expect(await page.locator('meta[property="og:url"]').getAttribute("content")).toBe(
      await page.locator('link[rel="canonical"]').getAttribute("href"),
    );
    expect((await request.get("og-image.webp")).ok()).toBe(true);
    const links = await page
      .locator("a[href]")
      .evaluateAll((items) => items.map((item) => item.getAttribute("href")));
    expect(links).not.toContain("#");
    for (const href of new Set(links)) {
      if (/^(?:https?:|mailto:|tel:)/.test(href)) {
        continue;
      }
      const url = new URL(href, page.url());
      expect(url.pathname.startsWith("/Digitalizing-for-Cafes/")).toBe(true);
      const response = await request.get(url.href);
      expect(response.ok(), href).toBe(true);
      if (url.hash) {
        expect(await response.text(), href).toContain(`id="${url.hash.slice(1)}"`);
      }
    }
    const live = Boolean(await page.locator("form").getAttribute("data-endpoint"));
    await page.locator("#phone").fill("+44 7700 900123");
    await page.locator("#email").fill("alex@example.com");
    await page.locator("#name").fill("Alex Smith");
    await page.locator(".form__checkmark").click();
    await page.locator(".form__submit").click();
    await expect(page.getByRole("status")).toContainText(
      live ? "has been sent" : "has not been sent or stored",
    );
    await page.locator("#phone").fill("123");
    if (live) {
      await page.locator("#email").fill("alex@example.com");
      await page.locator("#name").fill("Alex Smith");
      await page.locator(".form__checkmark").click();
    }
    await page.locator(".form__submit").click();
    await expect(page.locator("#phone")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("alert")).toBeVisible();
    expect(posts).toHaveLength(live ? 1 : 0);
    expect(errors).toEqual([]);
  });

  test(`${file}: responsive layout`, async ({ page }) => {
    for (const width of [320, 360, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(file);
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll, `${file} at ${width}px`).toBeLessThanOrEqual(dimensions.client + 1);
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const dimensions = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  });
}

test("mobile menu and plan tabs support keyboard navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await page.goto("plans.html");
  const menu = page.getByRole("button", { name: "Open menu" });
  await expect(page.locator("#overlay")).toHaveJSProperty("inert", true);
  await menu.click();
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }).getByRole("link").first(),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(page.locator("#overlay")).toHaveJSProperty("inert", true);
  const basic = page.getByRole("tab", { name: "Basic", exact: true });
  await basic.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Plus", exact: true })).toBeFocused();
  await expect(page.getByRole("tabpanel", { name: "Plus", exact: true })).toBeVisible();
  await expect(page.locator("#column-basic")).toBeHidden();
  await page.keyboard.press("End");
  await expect(page.getByRole("tabpanel", { name: "Business", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1920, height: 900 });
  await expect(page.locator("#column-basic")).toBeVisible();
  await expect(page.locator("#column-plus")).toBeVisible();
});

test("generated SEO files use published URLs", async ({ request }) => {
  const sitemap = await request.get("sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const body = await sitemap.text();
  expect(body).toContain("https://ikatenev.github.io/Digitalizing-for-Cafes/plans.html");
  expect(body).not.toContain("%VITE_");
  expect(await (await request.get("robots.txt")).text()).toContain(
    "Sitemap: https://ikatenev.github.io/Digitalizing-for-Cafes/sitemap.xml",
  );
});

test("live form reports delivery failures honestly and accepts confirmed delivery", async ({
  page,
}) => {
  await page.route("**/index.html", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /data-endpoint(?:="[^"]*")?/,
      'data-endpoint="https://enquiries.example/enquiry"',
    );
    await route.fulfill({ response, body });
  });
  let deliver = false;
  let calls = 0;
  await page.route("https://enquiries.example/enquiry", async (route) => {
    calls++;
    const payload = route.request().postDataJSON();
    expect(payload.agreement).toBe(true);
    expect(payload.email).toBe("alex@example.com");
    await route.fulfill({
      status: deliver ? 200 : 502,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: deliver,
        message: deliver ? "Your enquiry has been sent." : "Your enquiry could not be delivered.",
      }),
    });
  });
  await page.goto("index.html");
  await page.locator("#phone").fill("07700 900123");
  await page.locator("#email").fill("alex@example.com");
  await page.locator("#name").fill("Alex Smith");
  await page.locator(".form__checkmark").click();
  await page.locator(".form__submit").click();
  await expect(page.getByRole("alert")).toContainText("could not be delivered");
  await expect(page.locator("#email")).toHaveValue("alex@example.com");
  deliver = true;
  await page.locator(".form__submit").click();
  await expect(page.getByRole("status")).toContainText("has been sent");
  await expect(page.locator("#email")).toHaveValue("");
  expect(calls).toBe(2);
});
