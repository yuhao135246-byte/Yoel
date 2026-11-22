import { expect, test } from "@playwright/test";

const CHECKOUT_MEMORY_KEY = "cadence_checkout_memory_v1";
const CUSTOMER_HISTORY_KEY = "cadence_customer_history_v1";

test("customer can submit a cold brew order", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "每周冷萃与季节饮品", exact: true })).toBeVisible();
  await page.screenshot({ path: "outputs/e2e/01-homepage.png", fullPage: true });

  await page.goto("/coffee");
  await expect(page.getByRole("heading", { name: "本周菜单", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "加入购物车" }).first().click();
  await expect(page.getByText("已加入购物车")).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "本周菜单", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "加入购物车" }).first().click();
  await expect(page.getByText("已加入购物车")).toBeVisible();

  await page.goto("/cart");
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

test("checkout auto-fills local customer details when a matching name is entered", async ({ page }) => {
  await page.goto("/checkout");
  await page.evaluate((key) => {
    window.localStorage.setItem(key, JSON.stringify([
      {
        name: "老客户",
        phone: "13800001111",
        address: "上海浦东新区产品路 110 号",
        notes: "历史备注：门口留纸箱",
        createdAt: "2024-01-02T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z"
      }
    ]));
  }, CUSTOMER_HISTORY_KEY);
  await page.reload();

  const apiRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/")) {
      apiRequests.push(url);
    }
  });

  await page.getByLabel("姓名").fill("老客户");

  await expect(page.getByLabel("电话")).toHaveValue("13800001111");
  await expect(page.getByLabel("地址")).toHaveValue("上海浦东新区产品路 110 号");
  await expect(page.getByLabel("备注")).toHaveValue("历史备注：门口留纸箱");
  expect(apiRequests).toEqual([]);
});

test("checkout asks the customer to choose among multiple local history matches", async ({ page }) => {
  await page.goto("/checkout");
  await page.evaluate((key) => {
    window.localStorage.setItem(key, JSON.stringify([
      {
        name: "同名顾客",
        phone: "13800002222",
        address: "上海静安区南京西路 1 号",
        notes: "第一个地址",
        createdAt: "2024-01-02T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z"
      },
      {
        name: "同名顾客",
        phone: "13900003333",
        address: "上海徐汇区淮海中路 99 号",
        notes: "第二个地址",
        createdAt: "2024-01-03T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z"
      }
    ]));
  }, CUSTOMER_HISTORY_KEY);
  await page.reload();

  await page.getByLabel("姓名").fill("同名顾客");

  await expect(page.getByLabel("历史配送信息")).toBeVisible();
  await expect(page.getByLabel("电话")).toHaveValue("");
  await expect(page.getByLabel("地址")).toHaveValue("");

  await page.getByLabel("历史配送信息").selectOption({ label: "13900003333 / 上海徐汇区淮海中路 99 号" });
  await expect(page.getByLabel("电话")).toHaveValue("13900003333");
  await expect(page.getByLabel("地址")).toHaveValue("上海徐汇区淮海中路 99 号");
  await page.getByLabel("地址").fill("新地址：手动修改后覆盖");
  await expect(page.getByLabel("地址")).toHaveValue("新地址：手动修改后覆盖");
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

test("checkout clears local history gracefully when browser data is removed", async ({ page }) => {
  await page.goto("/checkout");
  await page.evaluate((key) => {
    window.localStorage.setItem(key, JSON.stringify([
      {
        name: "清空历史",
        phone: "13888888888",
        address: "上海宝山路 888 号",
        notes: "会被清空",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      }
    ]));
  }, CUSTOMER_HISTORY_KEY);
  await page.reload();

  await page.evaluate(() => window.localStorage.removeItem("cadence_customer_history_v1"));
  await page.reload();

  await page.getByLabel("姓名").fill("清空历史");
  await expect(page.getByLabel("电话")).toHaveValue("");
  await expect(page.getByLabel("地址")).toHaveValue("");
  await expect(page.getByLabel("备注")).toHaveValue("");
});
