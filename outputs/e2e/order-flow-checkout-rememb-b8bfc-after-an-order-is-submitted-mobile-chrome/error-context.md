# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order-flow.spec.ts >> checkout remembers local customer details after an order is submitted
- Location: tests\e2e\order-flow.spec.ts:33:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/cart$/
Received string:  "http://127.0.0.1:3000/coffee"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://127.0.0.1:3000/coffee"

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
  - paragraph: 本周菜单
  - heading "本周菜单" [level=1]
  - paragraph: 以冷萃为核心，记录不同产地、处理法与发酵实验带来的风味变化。
  - article:
    - link "摩卡":
      - /url: /coffee
      - img "摩卡"
    - paragraph
    - heading "摩卡" [level=3]
    - paragraph: 坦桑尼亚奶咖拼配豆 与比利时 布夏德巧克力
    - paragraph: ¥20
    - paragraph: 摩卡是意式拿铁咖啡变种，双份浓缩+巧克力+巧克力酱+巧克力粉 再加入蒸汽奶 ，通常不会像传统卡布奇诺那么厚重，是澳洲咖啡文化很容易辨别的元素
    - paragraph: Available
    - paragraph: 仅剩 10
  - button "加入购物车"
  - article:
    - link "柠檬莱姆苦精":
      - /url: /coffee
      - img "柠檬莱姆苦精"
    - paragraph
    - heading "柠檬莱姆苦精" [level=3]
    - paragraph: 改良 澳大利亚国民饮品L.L.B
    - paragraph: ¥18
    - paragraph: 柠檬莱姆苦精是一种由柠檬水，浓缩莱姆汁和自制苦精调成的饮料，苦精具有低酒精含量，一般被认为是一种鸡尾酒
    - paragraph: • 由Cadence 改良，自制朗姆酒苦精
    - paragraph: Available
    - paragraph: 仅剩 10
  - button "加入购物车"
  - article:
    - link "Latte / 拿铁":
      - /url: /coffee
      - img "Latte / 拿铁"
    - paragraph: 奶咖系列
    - heading "Latte / 拿铁" [level=3]
    - paragraph: ¥18
    - paragraph: 丝滑奶泡与浓郁咖啡的经典组合，热或冰两种口感可选。
    - paragraph: • 温度可选：热拿铁 / 冰拿铁
    - paragraph: Available（可售）
    - paragraph: 仅剩 10
  - text: 温度 / Temperature（必选）
  - combobox "latte-temperature":
    - option "请选择"
    - option "热拿铁 / Hot Latte · ¥18" [selected]
    - option "冰拿铁 / Ice Latte · ¥18"
  - button "加入购物车"
  - article:
    - link "卡布奇诺":
      - /url: /coffee
      - img "卡布奇诺"
    - paragraph
    - heading "卡布奇诺" [level=3]
    - paragraph: ¥19
    - paragraph: 澳式卡布奇诺 绵密细腻奶泡 顶部倾覆可可粉
    - paragraph: • 选用坦桑尼亚 中深烘拼配
    - paragraph: Available
    - paragraph: 仅剩 10
  - button "加入购物车"
  - article:
    - 'link "哥伦比亚 拉索一号 #热门回归"':
      - /url: /coffee
      - 'img "哥伦比亚 拉索一号 #热门回归"'
    - paragraph: 冷萃系列
    - 'heading "哥伦比亚 拉索一号 #热门回归" [level=3]'
    - paragraph: 品种：Caturra（卡杜拉）与 Castillo（卡斯蒂略） → 产区：哥伦比亚 Huila（惠兰省） 海拔：1750 米以上
    - paragraph: ¥46
    - paragraph: 厌氧水洗（Anaerobic Washed）
    - paragraph: • 榛子，杏干，桃子
    - paragraph: 周一至周日上午配送
    - paragraph: 仅剩 10
  - button "加入购物车"
  - article:
    - link "巴拿马詹森瑰夏 By Neway":
      - /url: /coffee
      - img "巴拿马詹森瑰夏 By Neway"
    - paragraph
    - heading "巴拿马詹森瑰夏 By Neway" [level=3]
    - paragraph: ¥98
    - paragraph: Los Aples Lot 1056 by Neway 巴拿马 Volcan 产区 由Janson 家族出品（浅焙） 48小时低温发酵日晒 海拔1800米以上
    - paragraph: • 桃花（Peach Blossom）甜橙（Orange）蔓越莓（Cranberry）
    - paragraph: Available
    - paragraph: 仅剩 10
  - button "加入购物车"
  - article:
    - link "TND 哥伦比亚 PEZ糖":
      - /url: /coffee
      - img "TND 哥伦比亚 PEZ糖"
    - paragraph: 限时供应
    - heading "TND 哥伦比亚 PEZ糖" [level=3]
    - paragraph: ¥53
    - paragraph: 来自捷克 The Naughty Dog 的特别批次 Cold Batch Brew。选用哥伦比亚 Finca Las Flores 厌氧水洗咖啡豆，呈现橙子与柠檬的明亮果香，伴随 PEZ 糖般的甜感，以及牛奶巧克力和香料茶尾韵，层次丰富，风味鲜明。
    - paragraph: • 规格：400 ml
    - paragraph: • 烘焙：The Naughty Dog（捷克）
    - paragraph: • 产地：哥伦比亚
    - paragraph: • 庄园：Finca Las Flores
    - paragraph: • 处理法：厌氧水洗
    - paragraph: • 风味：橙子、柠檬、PEZ 糖、牛奶巧克力、香料茶
    - paragraph: 周一至周日上午配送
    - paragraph: 仅剩 10
  - button "加入购物车"
  - article:
    - link "Los Patios Gigante Peach":
      - /url: /coffee
      - img "Los Patios Gigante Peach"
    - paragraph: 冷萃系列
    - heading "Los Patios Gigante Peach" [level=3]
    - paragraph: 哥伦比亚 Los Patios生产站生产
    - paragraph: ¥43
    - paragraph: 海拔：1600-1900m 处理法：Co ferment 果子联合发酵 豆种：卡斯蒂略 由 Black & White coffee roasters （美国）生产
    - paragraph: • 热带水果，棉花糖，波霸奶茶
    - paragraph: 周一至周日上午配送
    - paragraph: 仅剩 15
  - button "加入购物车"
  - article:
    - link "TANAT Sidra 希爪 厌氧日晒":
      - /url: /coffee
      - img "TANAT Sidra 希爪 厌氧日晒"
    - paragraph: 冷萃系列
    - heading "TANAT Sidra 希爪 厌氧日晒" [level=3]
    - paragraph: 哥伦比亚｜皮塔利托｜Nestor Lasso 89分
    - paragraph: ¥48
    - paragraph: 杏子｜草莓｜樱桃
    - paragraph: • 杏子
    - paragraph: • 草莓
    - paragraph: • 樱桃
    - paragraph: 周一至周日上午配送
    - paragraph: 仅剩 15
  - button "加入购物车"
  - article:
    - link "季节水果柠檬茶 1000ml":
      - /url: /coffee
      - img "季节水果柠檬茶 1000ml"
    - paragraph: 季节饮品
    - heading "季节水果柠檬茶 1000ml" [level=3]
    - paragraph: ¥16
    - paragraph: 季节水果与手工冷泡茶。
    - paragraph: • 柠檬
    - paragraph: • 西瓜 & 甜橙
    - paragraph: • 茉莉花茶
    - paragraph: 周一至周日上午配送
    - paragraph: 仅剩 30
  - button "加入购物车"
  - article:
    - link "甜椒鸡肉卷":
      - /url: /coffee
      - img "甜椒鸡肉卷"
    - paragraph: Chicken Wrap（鸡肉卷）
    - heading "甜椒鸡肉卷" [level=3]
    - paragraph: ¥22
    - paragraph: 手作甜椒酱、生菜、鸡腿肉、坚果、芝士片、黄油炒蛋
    - paragraph: • 手作甜椒酱
    - paragraph: • 生菜
    - paragraph: • 鸡腿肉
    - paragraph: • 坚果
    - paragraph: • 芝士片
    - paragraph: • 黄油炒蛋
    - paragraph: Available（可售）
    - paragraph: 仅剩 10
  - button "加入购物车"
  - article:
    - link "番茄咖喱鸡肉卷":
      - /url: /coffee
      - img "番茄咖喱鸡肉卷"
    - paragraph: Chicken Wrap（鸡肉卷）
    - heading "番茄咖喱鸡肉卷" [level=3]
    - paragraph: ¥22
    - paragraph: 番茄｜咖喱｜生菜｜黄油炒蛋
    - paragraph: • 番茄
    - paragraph: • 咖喱
    - paragraph: • 生菜
    - paragraph: • 黄油炒蛋
    - paragraph: Available（可售）
    - paragraph: 仅剩 10
  - button "加入购物车"
  - article:
    - link "低卡鸡肉卷水果茶午餐":
      - /url: /coffee
      - img "低卡鸡肉卷水果茶午餐"
    - paragraph: Lunch Combo（午餐套餐）
    - heading "低卡鸡肉卷水果茶午餐" [level=3]
    - paragraph: ¥35
    - paragraph: 鸡肉卷二选一｜水果茶
    - paragraph: • 鸡肉卷选择（必选）：甜椒鸡肉卷 / 番茄咖喱鸡肉卷
    - paragraph: • 水果茶
    - paragraph: Available（可售）
    - paragraph: 仅剩 10
  - text: 鸡肉卷选择（必选）
  - combobox "low-cal-wrap-fruit-tea-lunch-combo-wrapChoice":
    - option "请选择"
    - option "甜椒鸡肉卷" [selected]
    - option "番茄咖喱鸡肉卷"
  - button "加入购物车"
  - paragraph: 配送预订
  - heading "简洁的产品预订" [level=2]
  - paragraph: 选择产品、数量、配送日期与时段，完成配送信息填写。早晨配送窗口为固定时段。
  - text: 产品
  - combobox "产品":
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
  - text: 数量
  - spinbutton "数量": "1"
  - text: 配送日期
  - combobox "配送日期":
    - option "明天（2026-09-08）" [selected]
  - text: 配送时间窗口：07:00 - 12:00 配送时间段
  - combobox "配送时间段":
    - option "07:30" [selected]
    - option "08:00"
    - option "08:30"
    - option "09:00"
    - option "09:30"
    - option "10:00"
    - option "10:30"
    - option "11:00"
  - textbox "姓名"
  - textbox "电话"
  - textbox "配送地址"
  - paragraph: 订单编号 CD-20260907-0001
  - paragraph: 配送日期 Tue, Sep 8
  - paragraph: 配送时段 07:30 / 时间窗口 07:00 - 12:00
  - paragraph: RMB 18
  - link "前往结算":
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
  1  | ﻿import { expect, test } from "@playwright/test";
  2  | 
  3  | const CHECKOUT_MEMORY_KEY = "cadence_checkout_memory_v1";
  4  | 
  5  | test("customer can submit a cold brew order", async ({ page }) => {
  6  |   await page.goto("/");
  7  |   await expect(page.getByText("冷萃与季节饮品")).toBeVisible();
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
> 37 |   await expect(page).toHaveURL(/\/cart$/);
     |                      ^ Error: expect(page).toHaveURL(expected) failed
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