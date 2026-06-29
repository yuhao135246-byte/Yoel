import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? "587");
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const recipient = process.env.ORDER_NOTIFICATION_TO ?? "yuhdesign@163.com";
const fromAddress = process.env.ORDER_NOTIFICATION_FROM ?? user ?? "no-reply@cadence.local";

function getTransporter() {
  console.log({
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT
  });

  if (!host || !user || !pass) {
    console.error("SMTP 未配置，无法发送邮件", {
      hasHost: Boolean(host),
      hasUser: Boolean(user),
      hasPass: Boolean(pass),
      port,
      recipient,
      fromAddress
    });
    throw new Error("SMTP 未配置，无法发送邮件。");
  }

  console.log("准备创建邮件传输器", {
    host,
    port,
    user,
    recipient,
    fromAddress
  });

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

export async function sendOrderNotification(details: {
  orderNumber: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  items: { name: string; quantity: number; price: number }[];
  deliveryDate?: string;
  deliveryArea?: string;
  deliverySlot?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  console.log("SMTP配置", {
    host,
    port,
    user,
    recipient,
    fromAddress
  });

  const transporter = getTransporter();
  const htmlItems = details.items
    .map((item) => `<li>${item.name} x ${item.quantity} - RMB ${item.price * item.quantity}</li>`)
    .join("");

  const html = `
    <h1>新订单通知</h1>
    <p>订单号：${details.orderNumber}</p>
    <p>姓名：${details.name}</p>
    <p>手机号：${details.phone}</p>
    <p>地址：${details.address}</p>
    <p>配送日期：${details.deliveryDate ?? "未填写"}</p>
    <p>配送区域：${details.deliveryArea ?? "未填写"}</p>
    <p>预计配送时间：${details.deliverySlot ?? "未填写"}</p>
    <p>备注：${details.notes ?? "无"}</p>
    <p>商品金额：RMB ${details.subtotal}</p>
    <p>配送费：RMB ${details.deliveryFee}</p>
    <p>订单总额：RMB ${details.total}</p>
    <p>商品列表：</p>
    <ul>${htmlItems}</ul>
  `;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: recipient,
    subject: `新订单 ${details.orderNumber}`,
    text: `新订单 ${details.orderNumber}\n姓名：${details.name}\n手机号：${details.phone}\n地址：${details.address}\n配送日期：${details.deliveryDate ?? "未填写"}\n配送区域：${details.deliveryArea ?? "未填写"}\n预计配送时间：${details.deliverySlot ?? "未填写"}\n备注：${details.notes ?? "无"}\n商品金额：RMB ${details.subtotal}\n配送费：RMB ${details.deliveryFee}\n订单总额：RMB ${details.total}\n商品：${details.items
      .map((item) => `${item.name} x ${item.quantity} - RMB ${item.price * item.quantity}`)
      .join("; ")}`,
    html
  });

  console.log("订单通知邮件发送成功", {
    orderNumber: details.orderNumber,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected
  });
}
