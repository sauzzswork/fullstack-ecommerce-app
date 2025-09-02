const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test DB connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to MySQL database');
    connection.release();
  }
});

// --------- API Endpoints ---------

// Get all products
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get product by ID
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
});

// Add new product
app.post('/products', (req, res) => {
  const { name, description, price, image_url } = req.body;
  db.query(
    'INSERT INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)',
    [name, description, price, image_url],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, name, description, price, image_url });
    }
  );
});

// Register user
app.post('/users/register', (req, res) => {
  const { name, email, password } = req.body;
  // Hashing password is recommended, but for simplicity it's skipped here
  db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, name, email });
    }
  );
});

// Get orders for a user
app.get('/orders', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  db.query(
    `SELECT o.id, o.status, o.created_at, oi.product_id, oi.quantity, p.name, p.price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      // Optional: group items by order_id for better response structure
      let orders = {};
      results.forEach(row => {
        if (!orders[row.id]) {
          orders[row.id] = {
            orderId: row.id,
            status: row.status,
            createdAt: row.created_at,
            items: []
          };
        }
        orders[row.id].items.push({
          productId: row.product_id,
          quantity: row.quantity,
          name: row.name,
          price: row.price
        });
      });
      res.json(Object.values(orders));
    }
  );
});

// Create a new order
app.post('/orders', (req, res) => {
  const { userId, items } = req.body; // items = [{productId, quantity}, ...]

  if (!userId || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Missing userId or items' });
  }

  // Start transaction
  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: err.message });

    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: err.message });
      }

      // Insert order
      connection.query(
        'INSERT INTO orders (user_id, status) VALUES (?, ?)',
        [userId, 'pending'],
        (err, result) => {
          if (err) return rollback(connection, res, err);

          const orderId = result.insertId;

          // Insert order items
          const itemValues = items.map(item => [orderId, item.productId, item.quantity]);
          connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity) VALUES ?',
            [itemValues],
            (err) => {
              if (err) return rollback(connection, res, err);

              connection.commit(err => {
                if (err) return rollback(connection, res, err);

                connection.release();
                res.status(201).json({ message: 'Order created', orderId });
              });
            }
          );
        }
      );
    });
  });

  function rollback(connection, res, err) {
    connection.rollback(() => {
      connection.release();
      res.status(500).json({ error: err.message });
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
