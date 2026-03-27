const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ── КАТЕГОРИИ ──────────────────────────

router.get('/categories', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/categories', verifyToken, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim().slice(0, 100);
    const description = String(req.body.description || '').trim().slice(0, 500);
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('POST /categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/categories/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const name = String(req.body.name || '').trim().slice(0, 100);
    const description = String(req.body.description || '').trim().slice(0, 500);
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await db.query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/categories/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    await db.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── ТОВАРЫ ─────────────────────────────

router.get('/products', verifyToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/products', verifyToken, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim().slice(0, 150);
    const description = String(req.body.description || '').trim().slice(0, 1000);
    const price = parseFloat(req.body.price);
    const categoryId = req.body.categoryId ? parseInt(req.body.categoryId) : null;
    const imageUrl = String(req.body.imageUrl || '').trim().slice(0, 500);

    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (isNaN(price) || price < 0) return res.status(400).json({ error: 'Invalid price' });

    const result = await db.query(
      'INSERT INTO products (name, description, price, category_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, categoryId, imageUrl]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('POST /products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/products/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });

    const name = String(req.body.name || '').trim().slice(0, 150);
    const description = String(req.body.description || '').trim().slice(0, 1000);
    const price = parseFloat(req.body.price);
    const categoryId = req.body.categoryId ? parseInt(req.body.categoryId) : null;
    const imageUrl = String(req.body.imageUrl || '').trim().slice(0, 500);
    const available = req.body.available !== false;

    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (isNaN(price) || price < 0) return res.status(400).json({ error: 'Invalid price' });

    const result = await db.query(
      `UPDATE products SET name=$1, description=$2, price=$3, category_id=$4, image_url=$5, available=$6 WHERE id=$7 RETURNING *`,
      [name, description, price, categoryId, imageUrl, available, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/products/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── ЗАКАЗЫ ─────────────────────────────

router.get('/orders', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
