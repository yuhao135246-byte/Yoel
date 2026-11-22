# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order-flow.spec.ts >> customer can submit a cold brew order
- Location: tests\e2e\order-flow.spec.ts:6:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: 'Checkout' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: 'Checkout' })

```

```yaml
- banner:
  - link "CADENCE logo":
    - /url: /
    - img "CADENCE logo"
  - navigation:
    - link "本周冷萃":
      - /url: /coffee
    - link "设计档案":
      - /url: /objects
    - link "研究日志":
      - /url: /journal
    - link "关于":
      - /url: /about
- main:
  - paragraph: 购物车
  - heading "确认订单" [level=1]
  - img "COCONUT ABC CLOUD / 椰子水坚果云"
  - paragraph: COCONUT ABC CLOUD / 椰子水坚果云
  - paragraph: RMB 18 / 份
  - button "减少 COCONUT ABC CLOUD / 椰子水坚果云 数量": "-"
  - text: x 1
  - button "增加 COCONUT ABC CLOUD / 椰子水坚果云 数量": +
  - button "删除"
  - text: RMB 18 商品金额 RMB 18 配送费 RMB 2 订单总额 RMB 20
  - link "去结算":
    - /url: /checkout
- contentinfo:
  - img "Cadence"
  - paragraph: 冷萃研究与味觉记录。关注产地、处理法、发酵与冷萃萃取之间的关系。
  - link "本周菜单":
    - /url: /coffee
  - link "研究日志":
    - /url: /journal
  - link "关于":
    - /url: /about
  - paragraph: 微信支付 / 支付宝
  - paragraph: 郑州 | 早晨配送
- alert
- link "打开购物车，当前 1 件商品":
  - /url: /cart
  - text: 购物车 1
```

# Test source

```ts
  1   | ﻿import { expect, test } from "@playwright/test";
  2   | 
  3   | const CHECKOUT_MEMORY_KEY = "cadence_checkout_memory_v1";
  4   | const CUSTOMER_HISTORY_KEY = "cadence_customer_history_v1";
  5   | 
  6   | test("customer can submit a cold brew order", async ({ page }) => {
  7   |   await page.goto("/");
  8   |   await expect(page.getByRole("heading", { name: "每周冷萃与季节饮品", exact: true })).toBeVisible();
  9   |   await page.screenshot({ path: "outputs/e2e/01-homepage.png", fullPage: true });
  10  | 
  11  |   await page.goto("/coffee");
  12  |   await expect(page.getByRole("heading", { name: "本周菜单", exact: true })).toBeVisible();
  13  |   await page.getByRole("button", { name: "加入购物车" }).first().click();
  14  |   await expect(page.getByText("已加入购物车")).toBeVisible();
  15  | 
  16  |   await page.goto("/cart");
> 17  |   await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  18  |   await page.screenshot({ path: "outputs/e2e/02-cart.png", fullPage: true });
  19  | 
  20  |   await page.getByRole("link", { name: "Checkout" }).click();
  21  |   await expect(page).toHaveURL(/\/checkout$/);
  22  | 
  23  |   await page.getByLabel("姓名").fill("E2E Customer");
  24  |   await page.getByLabel("电话").fill("13812345678");
  25  |   await page.getByLabel("地址").fill("上海，徐汇，Test Address 101");
  26  |   await page.getByLabel("备注").fill("门铃坏了，放门口，咖啡不要太晚送");
  27  |   await page.getByLabel("配送日期").selectOption({ index: 0 });
  28  |   await page.waitForFunction(() => !document.querySelector('select[aria-label="配送区域"]').disabled);
  29  |   await page.getByLabel("配送区域").selectOption({ index: 1 });
  30  |   await page.screenshot({ path: "outputs/e2e/03-checkout-filled.png", fullPage: true });
  31  | 
  32  |   await page.getByTestId("submit-order").click();
  33  |   await expect(page).toHaveURL(/\/order-confirmation\//);
  34  |   await page.screenshot({ path: "outputs/e2e/04-confirmation.png", fullPage: true });
  35  | });
  36  | 
  37  | test("checkout remembers local customer details after an order is submitted", async ({ page }) => {
  38  |   await page.goto("/coffee");
  39  |   await expect(page.getByRole("heading", { name: "本周菜单", exact: true })).toBeVisible();
  40  |   await page.getByRole("button", { name: "加入购物车" }).first().click();
  41  |   await expect(page.getByText("已加入购物车")).toBeVisible();
  42  | 
  43  |   await page.goto("/cart");
  44  |   await page.getByRole("link", { name: "Checkout" }).click();
  45  |   await expect(page).toHaveURL(/\/checkout$/);
  46  | 
  47  |   await page.getByLabel("姓名").fill("本机顾客");
  48  |   await page.getByLabel("电话").fill("13800000000");
  49  |   await page.getByLabel("地址").fill("郑州，二七路，测试地址 101 号");
  50  |   await page.getByLabel("配送日期").selectOption({ index: 0 });
  51  |   await page.waitForFunction(() => !document.querySelector('select[aria-label="配送区域"]').disabled);
  52  |   await page.getByLabel("配送区域").selectOption({ index: 1 });
  53  |   await page.getByLabel("备注").fill("记住我，下次自动填充");
  54  | 
  55  |   await page.getByTestId("submit-order").click();
  56  |   await expect(page).toHaveURL(/\/order-confirmation\//);
  57  | 
  58  |   const saved = await page.evaluate((key) => {
  59  |     const raw = window.localStorage.getItem(key);
  60  |     return raw ? JSON.parse(raw) : null;
  61  |   }, CHECKOUT_MEMORY_KEY);
  62  | 
  63  |   expect(saved).toMatchObject({
  64  |     name: "本机顾客",
  65  |     phone: "13800000000",
  66  |     address: "郑州，二七路，测试地址 101 号",
  67  |     notes: "记住我，下次自动填充"
  68  |   });
  69  | 
  70  |   await page.goto("/checkout");
  71  |   await expect(page.getByLabel("姓名")).toHaveValue("本机顾客");
  72  |   await expect(page.getByLabel("电话")).toHaveValue("13800000000");
  73  |   await expect(page.getByLabel("地址")).toHaveValue("郑州，二七路，测试地址 101 号");
  74  |   await expect(page.getByLabel("备注")).toHaveValue("记住我，下次自动填充");
  75  |   await expect(page.getByText("已自动填写上次信息")).toBeVisible();
  76  | });
  77  | 
  78  | test("checkout auto-fills local customer details when a matching name is entered", async ({ page }) => {
  79  |   await page.goto("/checkout");
  80  |   await page.evaluate((key) => {
  81  |     window.localStorage.setItem(key, JSON.stringify([
  82  |       {
  83  |         name: "老客户",
  84  |         phone: "13800001111",
  85  |         address: "上海浦东新区产品路 110 号",
  86  |         notes: "历史备注：门口留纸箱",
  87  |         createdAt: "2024-01-02T00:00:00.000Z",
  88  |         updatedAt: "2024-01-02T00:00:00.000Z"
  89  |       }
  90  |     ]));
  91  |   }, CUSTOMER_HISTORY_KEY);
  92  |   await page.reload();
  93  | 
  94  |   const apiRequests: string[] = [];
  95  |   page.on("request", (request) => {
  96  |     const url = request.url();
  97  |     if (url.includes("/api/")) {
  98  |       apiRequests.push(url);
  99  |     }
  100 |   });
  101 | 
  102 |   await page.getByLabel("姓名").fill("老客户");
  103 | 
  104 |   await expect(page.getByLabel("电话")).toHaveValue("13800001111");
  105 |   await expect(page.getByLabel("地址")).toHaveValue("上海浦东新区产品路 110 号");
  106 |   await expect(page.getByLabel("备注")).toHaveValue("历史备注：门口留纸箱");
  107 |   expect(apiRequests).toEqual([]);
  108 | });
  109 | 
  110 | test("checkout asks the customer to choose among multiple local history matches", async ({ page }) => {
  111 |   await page.goto("/checkout");
  112 |   await page.evaluate((key) => {
  113 |     window.localStorage.setItem(key, JSON.stringify([
  114 |       {
  115 |         name: "同名顾客",
  116 |         phone: "13800002222",
  117 |         address: "上海静安区南京西路 1 号",
```