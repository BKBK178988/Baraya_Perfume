// routes/order.js
const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
// สมมติมี Order model หรือ service ที่บันทึกคำสั่งซื้อ
const OrderModel = require('../models/order');

router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    // 1) บันทึกคำสั่งซื้อ
    const order = await OrderModel.create(orderData);

    // 2) ส่งอีเมล์ (อะซิงโครนัส) — ฟังก์ชันนี้จะจัดส่งทั้งลูกค้าและแอดมิน
    emailService.sendOrderEmails(order).catch(err => {
      // บันทึกข้อผิดพลาดเพื่อ retry หรือ alert
      console.error('Failed to send order emails:', err);
    });

    // 3) ตอบกลับลูกค้า (HTTP)
    res.status(201).json({ success: true, orderId: order.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'cannot create order' });
  }
});

module.exports = router;