import { expect, test } from "@playwright/test";

test("customer can submit a weekly cold brew order", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("本周冰滴开放预订")).toBeVisible();
  await page.screenshot({ path: "outputs/e2e/01-homepage.png", fullPage: true });

  await page.goto("/coffee");
  await expect(page.getByText("Weekly Cold Brew").first()).toBeVisible();
  await page.getByTestId("add-to-cart-weekly-cold-brew").click();
  await expect(page).toHaveURL(/\\/cart$/);
  await page.screenshot({ path: "outputs/e2e/02-cart.png", fullPage: true });

  await page.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\\/checkout$/);
  await page.getByLabel("Name").fill("E2E Customer");
  await page.getByLabel("Phone").fill("13812345678");
  await page.getByLabel("WeChat").fill("e2e_wechat");
  await page.getByLabel("Address").fill("Shanghai, Xuhui, Test Address 101");
  await page.getByLabel("Notes").fill("门铃坏了，放门口，咖啡不要太晚送");
  await page.getByLabel("Delivery Date").selectOption({ index: 0 });
  await page.getByLabel("Delivery Slot").selectOption("08:30");
  await page.screenshot({ path: "outputs/e2e/03-checkout-filled.png", fullPage: true });

  await page.getByTestId("submit-order").click();
  await expect(page).toHaveURL(/\\/order-confirmation/);
  await expect(page.getByText("Order received.")).toBeVisible();
  await expect(page.getByText("Payment Status: Pending")).toBeVisible();
  await page.screenshot({ path: "outputs/e2e/04-confirmation.png", fullPage: true });

  await page.goto("/admin/orders");
  await expect(page.getByText("E2E Customer")).toBeVisible();
  await expect(page.getByText("Pending").first()).toBeVisible();
  await page.screenshot({ path: "outputs/e2e/05-admin-orders.png", fullPage: true });
});
