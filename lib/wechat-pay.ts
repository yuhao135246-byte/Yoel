export type WeChatPayDraft = {
  orderNumber: string;
  amount: number;
  description: string;
  openid?: string;
};

export async function createWeChatPayPrepay(input: WeChatPayDraft) {
  return {
    provider: "wechat_pay",
    status: "RESERVED",
    orderNumber: input.orderNumber,
    amount: input.amount,
    description: input.description,
    message: "Reserved integration point for WeChat Pay JSAPI / H5 payment."
  };
}
