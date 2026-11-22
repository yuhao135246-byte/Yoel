# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order-flow.spec.ts >> checkout remembers local customer details after an order is submitted
- Location: tests\e2e\order-flow.spec.ts:37:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: 'Checkout' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "CADENCE logo" [ref=e4] [cursor=pointer]:
        - /url: /
        - img "CADENCE logo" [ref=e5]
      - navigation [ref=e6]:
        - link "本周冷萃" [ref=e7] [cursor=pointer]:
          - /url: /coffee
        - link "设计档案" [ref=e8] [cursor=pointer]:
          - /url: /objects
        - link "研究日志" [ref=e9] [cursor=pointer]:
          - /url: /journal
        - link "关于" [ref=e10] [cursor=pointer]:
          - /url: /about
  - main [ref=e11]:
    - generic [ref=e12]:
      - paragraph [ref=e13]: 购物车
      - heading "确认订单" [level=1] [ref=e14]
      - generic [ref=e16]:
        - img "COCONUT ABC CLOUD / 椰子水坚果云" [ref=e18]
        - generic [ref=e19]:
          - paragraph [ref=e20]: COCONUT ABC CLOUD / 椰子水坚果云
          - paragraph [ref=e21]: RMB 18 / 份
        - generic [ref=e22]:
          - button "减少 COCONUT ABC CLOUD / 椰子水坚果云 数量" [ref=e23] [cursor=pointer]: "-"
          - generic [ref=e24]: x 1
          - button "增加 COCONUT ABC CLOUD / 椰子水坚果云 数量" [ref=e25] [cursor=pointer]: +
          - button "删除" [ref=e26] [cursor=pointer]
        - generic [ref=e27]: RMB 18
      - generic [ref=e28]:
        - generic [ref=e29]:
          - generic [ref=e30]: 商品金额
          - generic [ref=e31]: RMB 18
        - generic [ref=e32]:
          - generic [ref=e33]: 配送费
          - generic [ref=e34]: RMB 2
        - generic [ref=e35]:
          - generic [ref=e36]: 订单总额
          - generic [ref=e37]: RMB 20
      - link "去结算" [ref=e39] [cursor=pointer]:
        - /url: /checkout
  - contentinfo [ref=e40]:
    - generic [ref=e41]:
      - generic [ref=e42]:
        - img "Cadence" [ref=e43]
        - paragraph [ref=e44]: 冷萃研究与味觉记录。关注产地、处理法、发酵与冷萃萃取之间的关系。
      - generic [ref=e45]:
        - link "本周菜单" [ref=e46] [cursor=pointer]:
          - /url: /coffee
        - link "研究日志" [ref=e47] [cursor=pointer]:
          - /url: /journal
        - link "关于" [ref=e48] [cursor=pointer]:
          - /url: /about
      - generic [ref=e49]:
        - paragraph [ref=e50]: 微信支付 / 支付宝
        - paragraph [ref=e51]: 郑州 | 早晨配送
  - button "Open Next.js Dev Tools" [ref=e57] [cursor=pointer]:
    - img [ref=e58]
  - alert [ref=e61]
  - link "打开购物车，当前 1 件商品" [ref=e62] [cursor=pointer]:
    - /url: /cart
    - generic [ref=e63]: 购物车
    - img [ref=e64]
    - generic [ref=e68]: "1"
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
  17  |   await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
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
> 44  |   await page.getByRole("link", { name: "Checkout" }).click();
      |                                                      ^ Error: locator.click: Test timeout of 60000ms exceeded.
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
  118 |         notes: "第一个地址",
  119 |         createdAt: "2024-01-02T00:00:00.000Z",
  120 |         updatedAt: "2024-01-02T00:00:00.000Z"
  121 |       },
  122 |       {
  123 |         name: "同名顾客",
  124 |         phone: "13900003333",
  125 |         address: "上海徐汇区淮海中路 99 号",
  126 |         notes: "第二个地址",
  127 |         createdAt: "2024-01-03T00:00:00.000Z",
  128 |         updatedAt: "2024-01-03T00:00:00.000Z"
  129 |       }
  130 |     ]));
  131 |   }, CUSTOMER_HISTORY_KEY);
  132 |   await page.reload();
  133 | 
  134 |   await page.getByLabel("姓名").fill("同名顾客");
  135 | 
  136 |   await expect(page.getByLabel("历史配送信息")).toBeVisible();
  137 |   await expect(page.getByLabel("电话")).toHaveValue("");
  138 |   await expect(page.getByLabel("地址")).toHaveValue("");
  139 | 
  140 |   await page.getByLabel("历史配送信息").selectOption({ label: "13900003333 / 上海徐汇区淮海中路 99 号" });
  141 |   await expect(page.getByLabel("电话")).toHaveValue("13900003333");
  142 |   await expect(page.getByLabel("地址")).toHaveValue("上海徐汇区淮海中路 99 号");
  143 |   await page.getByLabel("地址").fill("新地址：手动修改后覆盖");
  144 |   await expect(page.getByLabel("地址")).toHaveValue("新地址：手动修改后覆盖");
```