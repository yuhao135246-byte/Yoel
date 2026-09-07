# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order-flow.spec.ts >> customer can submit a cold brew order
- Location: tests\e2e\order-flow.spec.ts:5:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('冷萃与季节饮品')
Expected: visible
Error: strict mode violation: getByText('冷萃与季节饮品') resolved to 3 elements:
    1) <h1 class="mt-4 max-w-5xl text-6xl leading-none md:mt-8 md:text-8xl">每周冷萃与季节饮品</h1> aka getByRole('heading', { name: '每周冷萃与季节饮品' })
    2) <h2 class="mt-3 max-w-3xl text-5xl leading-none md:mt-5 md:text-7xl">冷萃与季节饮品</h2> aka getByRole('heading', { name: '冷萃与季节饮品', exact: true })
    3) <p class="text-base leading-7 text-paper/70">以冷萃与季节饮品为载体，呈现当周风味与实验性组合。</p> aka getByText('以冷萃与季节饮品为载体，呈现当周风味与实验性组合。')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('冷萃与季节饮品')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "CADENCE logo" [ref=e6] [cursor=pointer]:
        - /url: /
        - img "CADENCE logo" [ref=e7]
      - navigation [ref=e8]:
        - link "本周冷萃" [ref=e9] [cursor=pointer]:
          - /url: /coffee
        - link "设计档案" [ref=e10] [cursor=pointer]:
          - /url: /objects
        - link "研究日志" [ref=e11] [cursor=pointer]:
          - /url: /journal
        - link "关于" [ref=e12] [cursor=pointer]:
          - /url: /about
  - main [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]:
          - paragraph [ref=e17]: 冷萃研究 / 菜单
          - heading "每周冷萃与季节饮品" [level=1] [ref=e18]
        - paragraph [ref=e19]: 以冷萃为核心，记录不同产地、处理法与发酵实验带来的风味变化。
      - generic [ref=e20]:
        - paragraph [ref=e21]: 冷萃系列
        - paragraph [ref=e22]: 季节饮品
        - paragraph [ref=e23]: UNIT 系列
        - paragraph [ref=e24]: 研究日志
    - generic [ref=e26]:
      - generic [ref=e27]:
        - paragraph [ref=e28]: 本周菜单
        - heading "冷萃与季节饮品" [level=2] [ref=e29]
      - generic [ref=e30]:
        - paragraph [ref=e31]: 精选四款
        - paragraph [ref=e32]: 以冷萃与季节饮品为载体，呈现当周风味与实验性组合。
        - generic [ref=e34]:
          - generic [ref=e35]:
            - generic [ref=e36]: 温度 / Temperature（必选）
            - combobox "latte-temperature" [ref=e37]:
              - option "请选择"
              - option "热拿铁 / Hot Latte · ¥18" [selected]
              - option "冰拿铁 / Ice Latte · ¥18"
          - button "加入购物车" [ref=e38] [cursor=pointer]
    - generic [ref=e39]:
      - article [ref=e40]:
        - link "Latte / 拿铁" [ref=e41] [cursor=pointer]:
          - /url: /coffee
          - img "Latte / 拿铁" [ref=e42]
        - generic [ref=e43]:
          - generic [ref=e44]:
            - generic [ref=e45]:
              - paragraph [ref=e46]: 奶咖系列
              - heading "Latte / 拿铁" [level=3] [ref=e47]
            - paragraph [ref=e48]: ¥18
          - paragraph [ref=e49]: 丝滑奶泡与浓郁咖啡的经典组合，热或冰两种口感可选。
          - generic [ref=e50]:
            - paragraph [ref=e51]: • 温度可选：热拿铁 / 冰拿铁
            - paragraph [ref=e52]: • 热拿铁：/assets/Latte.png
            - paragraph [ref=e53]: • 冰拿铁：/assets/Ice latte.png
          - paragraph [ref=e54]: Available（可售）
          - paragraph [ref=e55]: 仅剩 10
      - article [ref=e56]:
        - link "Unit 01" [ref=e57] [cursor=pointer]:
          - /url: /objects
          - img "Unit 01" [ref=e58]
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]:
              - paragraph [ref=e62]: 预售
              - heading "Unit 01" [level=3] [ref=e63]
              - paragraph [ref=e64]: 参数化环境灯
            - paragraph [ref=e65]: ¥330
          - paragraph [ref=e66]: Cadence 首件参数化环境灯作品。
          - generic [ref=e67]:
            - paragraph [ref=e68]: • 底座颜色可选
            - paragraph [ref=e69]: • 支持预售
            - paragraph [ref=e70]: • 沿用现有配送与库存体系
          - paragraph [ref=e71]: 预售中
    - generic [ref=e73]:
      - generic [ref=e74]:
        - paragraph [ref=e75]: 配送预订
        - heading "简洁的产品预订" [level=2] [ref=e76]
        - paragraph [ref=e77]: 选择产品、数量、配送日期与时段，完成配送信息填写。早晨配送窗口为固定时段。
      - generic [ref=e78]:
        - generic [ref=e79]:
          - text: 产品
          - combobox "产品" [ref=e80]:
            - option "Latte / 拿铁 / RMB 18" [selected]
            - option "哥伦比亚 Finca Las Flores Cold Batch Brew / RMB 53"
            - option "哥伦比亚 拉索一号#热门回归 / RMB 46"
            - option "Panama Elida Falda CRD GW0403 / RMB 102"
            - option "TANAT Ombligon 冷萃 / RMB 43"
            - option "TANAT Sidra 希爪 厌氧日晒 / RMB 48"
            - option "季节水果柠檬茶 / RMB 18"
            - option "甜椒鸡肉卷 / RMB 22"
            - option "番茄咖喱鸡肉卷 / RMB 22"
            - option "低卡鸡肉卷水果茶午餐 / RMB 35"
        - generic [ref=e81]:
          - text: 数量
          - spinbutton "数量" [ref=e82]: "1"
        - generic [ref=e83]:
          - text: 配送日期
          - combobox "配送日期" [ref=e84]:
            - option "明天（2026-09-08）" [selected]
        - generic [ref=e85]: 配送时间窗口：07:00 - 12:00
        - generic [ref=e86]:
          - text: 配送时间段
          - combobox "配送时间段" [ref=e87]:
            - option "07:30" [selected]
            - option "08:00"
            - option "08:30"
            - option "09:00"
            - option "09:30"
            - option "10:00"
            - option "10:30"
            - option "11:00"
        - generic [ref=e88]:
          - textbox "姓名" [ref=e89]
          - textbox "电话" [ref=e90]
        - textbox "配送地址" [ref=e91]
        - generic [ref=e92]:
          - paragraph [ref=e93]: 订单编号 CD-20260907-0001
          - paragraph [ref=e94]: 配送日期 Tue, Sep 8
          - paragraph [ref=e95]: 配送时段 07:30 / 时间窗口 07:00 - 12:00
          - paragraph [ref=e96]: RMB 18
        - link "前往结算" [ref=e97] [cursor=pointer]:
          - /url: /checkout
    - generic [ref=e98]:
      - link "Order Coffee" [ref=e99] [cursor=pointer]:
        - /url: /coffee
      - link "进入设计档案" [ref=e100] [cursor=pointer]:
        - /url: /objects
  - contentinfo [ref=e101]:
    - generic [ref=e102]:
      - generic [ref=e103]:
        - img "Cadence" [ref=e104]
        - paragraph [ref=e105]: 冷萃研究与味觉记录。关注产地、处理法、发酵与冷萃萃取之间的关系。
      - generic [ref=e106]:
        - link "本周菜单" [ref=e107] [cursor=pointer]:
          - /url: /coffee
        - link "研究日志" [ref=e108] [cursor=pointer]:
          - /url: /journal
        - link "关于" [ref=e109] [cursor=pointer]:
          - /url: /about
      - generic [ref=e110]:
        - paragraph [ref=e111]: 微信支付 / 支付宝
        - paragraph [ref=e112]: 郑州 | 早晨配送
  - button "Open Next.js Dev Tools" [ref=e118] [cursor=pointer]:
    - img [ref=e119]
  - alert [ref=e122]
  - link "打开购物车，当前 0 件商品" [ref=e123] [cursor=pointer]:
    - /url: /cart
    - generic [ref=e124]: 购物车
    - img [ref=e125]
    - generic [ref=e129]: "0"
```

# Test source

```ts
  1  | ﻿import { expect, test } from "@playwright/test";
  2  | 
  3  | const CHECKOUT_MEMORY_KEY = "cadence_checkout_memory_v1";
  4  | 
  5  | test("customer can submit a cold brew order", async ({ page }) => {
  6  |   await page.goto("/");
> 7  |   await expect(page.getByText("冷萃与季节饮品")).toBeVisible();
     |                                           ^ Error: expect(locator).toBeVisible() failed
  8  |   await page.screenshot({ path: "outputs/e2e/01-homepage.png", fullPage: true });
  9  | 
  10 |   await page.goto("/coffee");
  11 |   await expect(page.getByText("Latte / 拿铁").first()).toBeVisible();
  12 |   await page.getByRole("button", { name: "加入购物车" }).first().click();
  13 |   await expect(page).toHaveURL(/\/cart$/);
  14 |   await page.screenshot({ path: "outputs/e2e/02-cart.png", fullPage: true });
  15 | 
  16 |   await page.getByRole("link", { name: "Checkout" }).click();
  17 |   await expect(page).toHaveURL(/\/checkout$/);
  18 | 
  19 |   await page.getByLabel("姓名").fill("E2E Customer");
  20 |   await page.getByLabel("电话").fill("13812345678");
  21 |   await page.getByLabel("地址").fill("上海，徐汇，Test Address 101");
  22 |   await page.getByLabel("备注").fill("门铃坏了，放门口，咖啡不要太晚送");
  23 |   await page.getByLabel("配送日期").selectOption({ index: 0 });
  24 |   await page.waitForFunction(() => !document.querySelector('select[aria-label="配送区域"]').disabled);
  25 |   await page.getByLabel("配送区域").selectOption({ index: 1 });
  26 |   await page.screenshot({ path: "outputs/e2e/03-checkout-filled.png", fullPage: true });
  27 | 
  28 |   await page.getByTestId("submit-order").click();
  29 |   await expect(page).toHaveURL(/\/order-confirmation\//);
  30 |   await page.screenshot({ path: "outputs/e2e/04-confirmation.png", fullPage: true });
  31 | });
  32 | 
  33 | test("checkout remembers local customer details after an order is submitted", async ({ page }) => {
  34 |   await page.goto("/coffee");
  35 |   await expect(page.getByText("Latte / 拿铁").first()).toBeVisible();
  36 |   await page.getByRole("button", { name: "加入购物车" }).first().click();
  37 |   await expect(page).toHaveURL(/\/cart$/);
  38 | 
  39 |   await page.getByRole("link", { name: "Checkout" }).click();
  40 |   await expect(page).toHaveURL(/\/checkout$/);
  41 | 
  42 |   await page.getByLabel("姓名").fill("本机顾客");
  43 |   await page.getByLabel("电话").fill("13800000000");
  44 |   await page.getByLabel("地址").fill("郑州，二七路，测试地址 101 号");
  45 |   await page.getByLabel("配送日期").selectOption({ index: 0 });
  46 |   await page.waitForFunction(() => !document.querySelector('select[aria-label="配送区域"]').disabled);
  47 |   await page.getByLabel("配送区域").selectOption({ index: 1 });
  48 |   await page.getByLabel("备注").fill("记住我，下次自动填充");
  49 | 
  50 |   await page.getByTestId("submit-order").click();
  51 |   await expect(page).toHaveURL(/\/order-confirmation\//);
  52 | 
  53 |   const saved = await page.evaluate((key) => {
  54 |     const raw = window.localStorage.getItem(key);
  55 |     return raw ? JSON.parse(raw) : null;
  56 |   }, CHECKOUT_MEMORY_KEY);
  57 | 
  58 |   expect(saved).toMatchObject({
  59 |     name: "本机顾客",
  60 |     phone: "13800000000",
  61 |     address: "郑州，二七路，测试地址 101 号",
  62 |     notes: "记住我，下次自动填充"
  63 |   });
  64 | 
  65 |   await page.goto("/checkout");
  66 |   await expect(page.getByLabel("姓名")).toHaveValue("本机顾客");
  67 |   await expect(page.getByLabel("电话")).toHaveValue("13800000000");
  68 |   await expect(page.getByLabel("地址")).toHaveValue("郑州，二七路，测试地址 101 号");
  69 |   await expect(page.getByLabel("备注")).toHaveValue("记住我，下次自动填充");
  70 |   await expect(page.getByText("已自动填写上次信息")).toBeVisible();
  71 | });
  72 | 
  73 | test("checkout ignores corrupt local memory and keeps the form usable", async ({ page }) => {
  74 |   await page.goto("/checkout");
  75 |   await page.evaluate((key) => {
  76 |     window.localStorage.setItem(key, "{not valid json");
  77 |   }, CHECKOUT_MEMORY_KEY);
  78 |   await page.reload();
  79 | 
  80 |   await expect(page.getByLabel("姓名")).toHaveValue("");
  81 |   await expect(page.getByLabel("电话")).toHaveValue("");
  82 |   await expect(page.getByLabel("地址")).toHaveValue("");
  83 |   await expect(page.getByText("已自动填写上次信息")).toHaveCount(0);
  84 | });
  85 | 
```