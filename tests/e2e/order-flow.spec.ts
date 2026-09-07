import { expect, test } from "@playwright/test";

const CHECKOUT_MEMORY_KEY = "cadence_checkout_memory_v1";

test("customer can submit a cold brew order", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("冷萃与季节饮品")).toBeVisible();
  await page.screenshot({ path: "outputs/e2e/01-homepage.png", fullPage: true });

  await page.goto("/coffee");
  await expect(page.getByText("Latte / 拿铁").first()).toBeVisible();
  await page.getByRole("button", { name: "加入购物车" }).first().click();
  await expect(page).toHaveURL(/\/cart$/);
  await page.screenshot({ path: "outputs/e2e/02-cart.png", fullPage: true });

  await page.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  await page.getByLabel("姓名").fill("E2E Customer");
  await page.getByLabel("电话").fill("13812345678");
  await page.getByLabel("地址").fill("上海，徐汇，Test Address 101");
  await page.getByLabel("备注").fill("门铃坏了，放门口，咖啡不要太晚送");
  await page.getByLabel("配送日期").selectOption({ index: 0 });
  await page.waitForFunction(() => !document.querySelector('select[aria-label="配送区域"]').disabled);
  await page.getByLabel("配送区域").selectOption({ index: 1 });
  await page.screenshot({ path: "outputs/e2e/03-checkout-filled.png", fullPage: true });

  await page.getByTestId("submit-order").click();
  await expect(page).toHaveURL(/\/order-confirmation\//);
  await page.screenshot({ path: "outputs/e2e/04-confirmation.png", fullPage: true });
});

test("checkout remembers local customer details after an order is submitted", async ({ page }) => {
  await page.goto("/coffee");
  await expect(page.getByText("Latte / 拿铁").first()).toBeVisible();
  await page.getByRole("button", { name: "加入购物车" }).first().click();
  await expect(page).toHaveURL(/\/cart$/);

  await page.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  await page.getByLabel("姓名").fill("本机顾客");
  await page.getByLabel("电话").fill("13800000000");
  await page.getByLabel("地址").fill("郑州，二七路，测试地址 101 号");
  await page.getByLabel("配送日期").selectOption({ index: 0 });
  await page.waitForFunction(() => !document.querySelector('select[aria-label="配送区域"]').disabled);
  await page.getByLabel("配送区域").selectOption({ index: 1 });
  await page.getByLabel("备注").fill("记住我，下次自动填充");

  await page.getByTestId("submit-order").click();
  await expect(page).toHaveURL(/\/order-confirmation\//);

  const saved = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, CHECKOUT_MEMORY_KEY);

  expect(saved).toMatchObject({
    name: "本机顾客",
    phone: "13800000000",
    address: "郑州，二七路，测试地址 101 号",
    notes: "记住我，下次自动填充"
  });

  await page.goto("/checkout");
  await expect(page.getByLabel("姓名")).toHaveValue("本机顾客");
  await expect(page.getByLabel("电话")).toHaveValue("13800000000");
  await expect(page.getByLabel("地址")).toHaveValue("郑州，二七路，测试地址 101 号");
  await expect(page.getByLabel("备注")).toHaveValue("记住我，下次自动填充");
  await expect(page.getByText("已自动填写上次信息")).toBeVisible();
});

test("checkout ignores corrupt local memory and keeps the form usable", async ({ page }) => {
  await page.goto("/checkout");
  await page.evaluate((key) => {
    window.localStorage.setItem(key, "{not valid json");
  }, CHECKOUT_MEMORY_KEY);
  await page.reload();

  await expect(page.getByLabel("姓名")).toHaveValue("");
  await expect(page.getByLabel("电话")).toHaveValue("");
  await expect(page.getByLabel("地址")).toHaveValue("");
  await expect(page.getByText("已自动填写上次信息")).toHaveCount(0);
});
