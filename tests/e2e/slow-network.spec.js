import { test, expect } from "@playwright/test";

test("home remains usable on a slow 3G connection", async ({ page }) => {
  await page.route("**/*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 120));
    await route.continue();
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("body")).toContainText("SafeSpace", {
    timeout: 20_000,
  });
});

test("resources route reaches a usable page on a slow connection", async ({ page }) => {
  await page.route("**/*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 120));
    await route.continue();
  });

  await page.goto("/#/resources", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: /Hotlines|สายด่วน/ })
  ).toBeVisible({ timeout: 20_000 });
});
