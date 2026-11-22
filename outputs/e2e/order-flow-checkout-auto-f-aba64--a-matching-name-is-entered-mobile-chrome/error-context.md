# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order-flow.spec.ts >> checkout auto-fills local customer details when a matching name is entered
- Location: tests\e2e\order-flow.spec.ts:78:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "http://127.0.0.1:3000/api/order",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e1]:
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
        - paragraph [ref=e16]: 结算
        - heading "早晨配送" [level=1] [ref=e17]
        - paragraph [ref=e18]: 请填写姓名、电话、地址和备注，确认购物车后提交订单。
      - generic [ref=e19]:
        - generic [ref=e20]:
          - textbox "姓名" [active] [ref=e21]: 老客户
          - textbox "电话" [ref=e22]:
            - /placeholder: 手机号
            - text: "13800001111"
        - textbox "地址" [ref=e23]:
          - /placeholder: 收货地址
          - text: 上海浦东新区产品路 110 号
        - generic [ref=e24]:
          - generic [ref=e25]: 配送日期
          - combobox "配送日期" [ref=e26]:
            - option "请选择配送日期"
            - option "今天（2026-11-23）" [selected]
        - generic [ref=e27]:
          - generic [ref=e28]: 配送区域
          - combobox "配送区域" [ref=e29]:
            - option "请选择配送区域"
            - option "惠济区 / 07:00-08:30" [selected]
            - option "郑东新区 / 08:30-10:30"
            - option "金水区 / 10:30-12:00"
          - paragraph [ref=e30]: 预计配送时间：07:00-08:30
        - textbox "备注" [ref=e31]:
          - /placeholder: 备注（可选）
          - text: 历史备注：门口留纸箱
        - generic [ref=e32]:
          - generic [ref=e33]:
            - paragraph [ref=e34]:
              - generic [ref=e35]: 商品金额
              - generic [ref=e36]: RMB 0
            - paragraph [ref=e37]:
              - generic [ref=e38]: 配送费
              - generic [ref=e39]: RMB 0
          - paragraph [ref=e40]:
            - generic [ref=e41]: 订单总额
            - generic [ref=e42]: RMB 0
        - button "提交订单" [disabled] [ref=e43]
  - contentinfo [ref=e44]:
    - generic [ref=e45]:
      - generic [ref=e46]:
        - img "Cadence" [ref=e47]
        - paragraph [ref=e48]: 冷萃研究与味觉记录。关注产地、处理法、发酵与冷萃萃取之间的关系。
      - generic [ref=e49]:
        - link "本周菜单" [ref=e50] [cursor=pointer]:
          - /url: /coffee
        - link "研究日志" [ref=e51] [cursor=pointer]:
          - /url: /journal
        - link "关于" [ref=e52] [cursor=pointer]:
          - /url: /about
      - generic [ref=e53]:
        - paragraph [ref=e54]: 微信支付 / 支付宝
        - paragraph [ref=e55]: 郑州 | 早晨配送
  - button "Open Next.js Dev Tools" [ref=e61] [cursor=pointer]:
    - img [ref=e62]
  - alert [ref=e65]
```

# Test source

```ts
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
> 107 |   expect(apiRequests).toEqual([]);
      |                       ^ Error: expect(received).toEqual(expected) // deep equality
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
  145 | });
  146 | 
  147 | test("checkout ignores corrupt local memory and keeps the form usable", async ({ page }) => {
  148 |   await page.goto("/checkout");
  149 |   await page.evaluate((key) => {
  150 |     window.localStorage.setItem(key, "{not valid json");
  151 |   }, CHECKOUT_MEMORY_KEY);
  152 |   await page.reload();
  153 | 
  154 |   await expect(page.getByLabel("姓名")).toHaveValue("");
  155 |   await expect(page.getByLabel("电话")).toHaveValue("");
  156 |   await expect(page.getByLabel("地址")).toHaveValue("");
  157 |   await expect(page.getByText("已自动填写上次信息")).toHaveCount(0);
  158 | });
  159 | 
  160 | test("checkout clears local history gracefully when browser data is removed", async ({ page }) => {
  161 |   await page.goto("/checkout");
  162 |   await page.evaluate((key) => {
  163 |     window.localStorage.setItem(key, JSON.stringify([
  164 |       {
  165 |         name: "清空历史",
  166 |         phone: "13888888888",
  167 |         address: "上海宝山路 888 号",
  168 |         notes: "会被清空",
  169 |         createdAt: "2024-01-01T00:00:00.000Z",
  170 |         updatedAt: "2024-01-01T00:00:00.000Z"
  171 |       }
  172 |     ]));
  173 |   }, CUSTOMER_HISTORY_KEY);
  174 |   await page.reload();
  175 | 
  176 |   await page.evaluate(() => window.localStorage.removeItem("cadence_customer_history_v1"));
  177 |   await page.reload();
  178 | 
  179 |   await page.getByLabel("姓名").fill("清空历史");
  180 |   await expect(page.getByLabel("电话")).toHaveValue("");
  181 |   await expect(page.getByLabel("地址")).toHaveValue("");
  182 |   await expect(page.getByLabel("备注")).toHaveValue("");
  183 | });
  184 | 
```