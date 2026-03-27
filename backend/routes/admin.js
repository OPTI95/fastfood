const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ===== КАТЕГОРИИ =====

// Get all categories
router.get('/categories', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add category
router.post('/categories', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update category
router.put('/categories/:id', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await db.query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete category
router.delete('/categories/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== ТОВАРЫ =====

// Get all products (admin)
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
    res.status(500).json({ error: err.message });
  }
});

// Add product
router.post('/products', verifyToken, async (req, res) => {
  try {
    const { name, description, price, categoryId, imageUrl } = req.body;
    const result = await db.query(
      'INSERT INTO products (name, description, price, category_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, categoryId, imageUrl]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update product
router.put('/products/:id', verifyToken, async (req, res) => {
  try {
    const { name, description, price, categoryId, imageUrl, available } = req.body;
    const result = await db.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, category_id = $4, image_url = $5, available = $6
       WHERE id = $7 RETURNING *`,
      [name, description, price, categoryId, imageUrl, available, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete product
router.delete('/products/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== ЗАКАЗЫ =====

// Get all orders (admin)
router.get('/orders', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
