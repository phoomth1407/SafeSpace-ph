import { test, expect } from "@playwright/test";

async function addSlowNetwork(page) {
  await page.route("**/*", async (route) => {
    const type = route.request().resourceType();

    // Add a small delay to document/script/style requests rather than every
    // image/font/API request. This keeps the test realistic without making
    // lazy-loaded routes exceed CI timeouts.
    if (["document", "script", "stylesheet"].includes(type)) {
      await new Promise((resolve) => setTimeout(resolve, 60));
    }

    await route.continue();
  });
}

test("home remains usable on a slow connection", async ({ page }) => {
  await addSlowNetwork(page);

  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 30_000 });

  await expect(page.locator("body")).toContainText("SafeSpace", {
    timeout: 30_000,
  });
});

test("resources route reaches a usable page on a slow connection", async ({ page }) => {
  await addSlowNetwork(page);

  await page.addInitScript(() => localStorage.setItem("safespace_lang", "th"));

  await page.goto("/#/resources", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });

  await expect(page.locator("body")).toContainText(
    /สายด่วนและแหล่งข้อมูล|Hotlines and Resources/,
    { timeout: 30_000 }
  );
});
