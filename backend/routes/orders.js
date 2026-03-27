const express = require('express');
const axios = require('axios');
const db = require('../db');

const router = express.Router();

// Send order to WhatsApp via Twilio
const sendToWhatsApp = async (phoneNumber, orderText) => {
  try {
    // Используем Twilio API (нужно установить учетные данные в .env)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
      console.log('⚠️ Twilio not configured, skipping WhatsApp send');
      return true;
    }

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        From: `whatsapp:${twilioNumber}`,
        To: `whatsapp:${phoneNumber}`,
        Body: orderText
      },
      {
        auth: {
          username: accountSid,
          password: authToken
        }
      }
    );

    return response.status === 201;
  } catch (err) {
    console.error('WhatsApp send error:', err.message);
    return false;
  }
};

// Create order
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, items } = req.body;

    let totalPrice = 0;
    let orderText = `📱 *Новый заказ от ${customerName}*\n\n`;
    orderText += `☎️ Телефон: ${customerPhone}\n\n`;
    orderText += `*Товары:*\n`;

    for (const item of items) {
      const productResult = await db.query('SELECT * FROM products WHERE id = $1', [item.id]);
      if (productResult.rows.length > 0) {
        const product = productResult.rows[0];
        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;
        orderText += `• ${product.name} x${item.quantity} = ${itemTotal.toFixed(2)} ₽\n`;
      }
    }

    orderText += `\n*Итого: ${totalPrice.toFixed(2)} ₽*`;

    const result = await db.query(
      'INSERT INTO orders (customer_name, customer_phone, total_price, items, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [customerName, customerPhone, totalPrice, JSON.stringify(items), 'pending']
    );

    // Send to WhatsApp
    const whatsappSent = await sendToWhatsApp(customerPhone, orderText);

    res.json({
      order: result.rows[0],
      whatsappSent,
      orderText
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
