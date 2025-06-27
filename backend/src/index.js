import express from 'express';
import cors from 'cors';
import { initDb, openDb } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

await initDb();

// --- Customers ---
app.get('/api/customers', async (req, res) => {
  const db = await openDb();
  const customers = await db.all('SELECT * FROM customers ORDER BY created_at DESC');
  res.json(customers);
});

app.post('/api/customers', async (req, res) => {
  const { name, phone, email, birthday, anniversary } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = await openDb();
  const result = await db.run(
    'INSERT INTO customers (name, phone, email, birthday, anniversary) VALUES (?, ?, ?, ?, ?)',
    [name, phone, email, birthday, anniversary]
  );
  res.json({ id: result.lastID });
});

// --- Invoices ---
app.get('/api/invoices', async (req, res) => {
  const db = await openDb();
  const invoices = await db.all(`
    SELECT invoices.*, customers.name as customer_name
    FROM invoices
    LEFT JOIN customers ON invoices.customer_id = customers.id
    ORDER BY invoices.created_at DESC
  `);
  res.json(invoices);
});

app.post('/api/invoices', async (req, res) => {
  const { customer_id, total_amount, discount, tax, payment_status } = req.body;
  if (!customer_id || !total_amount) return res.status(400).json({ error: 'Missing fields' });
  const db = await openDb();
  const result = await db.run(
    'INSERT INTO invoices (customer_id, total_amount, discount, tax, payment_status) VALUES (?, ?, ?, ?, ?)',
    [customer_id, total_amount, discount || 0, tax || 0, payment_status || 'Unpaid']
  );
  res.json({ id: result.lastID });
});

// --- Dashboard Stats ---
app.get('/api/dashboard', async (req, res) => {
  const db = await openDb();
  const totalCustomers = await db.get('SELECT COUNT(*) as count FROM customers');
  const totalInvoices = await db.get('SELECT COUNT(*) as count FROM invoices');
  const monthlyRevenue = await db.get(`
    SELECT IFNULL(SUM(total_amount),0) as sum FROM invoices
    WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
  `);
  // Dummy growth rate for demo
  res.json({
    totalCustomers: totalCustomers.count,
    totalInvoices: totalInvoices.count,
    monthlyRevenue: monthlyRevenue.sum,
    growthRate: '23.5%'
  });
});

// --- Service Analytics (dummy data for now) ---
app.get('/api/service-analytics', (req, res) => {
  res.json([
    { name: "Hair Cut & Style", value: 35, revenue: 8750, color: "#7c3aed" },
    { name: "Hair Color", value: 25, revenue: 6250, color: "#3b82f6" },
    { name: "Facial Treatment", value: 20, revenue: 4000, color: "#10b981" },
    { name: "Manicure & Pedicure", value: 12, revenue: 2400, color: "#f59e0b" },
    { name: "Massage", value: 8, revenue: 1600, color: "#ef4444" }
  ]);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Salon backend running on port ${PORT}`);
});
