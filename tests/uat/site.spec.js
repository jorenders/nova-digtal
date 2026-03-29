import { expect, test } from "@playwright/test";

test("homepage renders core sections and CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Nova Digital/);
  await expect(page.locator("h1")).toContainText("Websites die premium aanvoelen");
  await expect(page.locator("#services")).toBeVisible();
  await expect(page.locator("#process")).toBeVisible();
  await expect(page.locator("#contact .button-primary")).toHaveAttribute(
    "href",
    "mailto:hello@novadigital.be"
  );
});

test("navigation and language switch keep the site usable", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Diensten" }).click();
  await expect(page).toHaveURL(/#services/);
  await expect(page.locator("#services h2")).toContainText(
    "Vier kernaanbiedingen die versterken"
  );

  await page.getByRole("button", { name: "EN" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toContainText("Websites built to feel premium");
  await expect(page.getByRole("link", { name: "Book a call" })).toBeVisible();
});
