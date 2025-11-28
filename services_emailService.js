// services/emailService.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function renderTemplate(templateName, vars) {
  const tpl = fs.readFileSync(path.join(__dirname, '..', 'templates', templateName), 'utf8');
  // very simple replacement; for production ให้ใช้ templating engine เช่น EJS, Handlebars
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
}

async function sendMail(options) {
  return transporter.sendMail(options);
}

async function sendOrderEmails(order) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || 'no-reply@example.com';

  // เตรียมข้อมูลสำหรับ template
  const vars = {
    customer_name: order.customerName || '',
    order_id: order.id,
    total: order.total || '',
    order_items_html: (order.items || []).map(i => `<li>${i.name} x${i.qty} - ${i.price}</li>`).join(''),
  };

  const html = renderTemplate('order-confirmation.html', vars);
  const subject = `ยืนยันออเดอร์ #${order.id} — ขอบคุณที่สั่งซื้อ`;

  // ส่งไปหาลูกค้า
  await sendMail({
    from: fromEmail,
    to: order.customerEmail,
    subject,
    html,
  });

  // ส่งสำเนาไปยังแอดมิน
  await sendMail({
    from: fromEmail,
    to: adminEmail,
    subject: `[Admin] New order #${order.id}`,
    html,
  });
}

module.exports = { sendOrderEmails };