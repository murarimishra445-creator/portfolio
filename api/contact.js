// api/contact.js — Vercel Serverless Function
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

let cachedClient = null;

async function connectDB() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  try {
    const client = await connectDB();
    const db = client.db('portfolio');
    const collection = db.collection('messages');

    await collection.insertOne({
      name,
      email,
      message,
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true, message: 'Message saved!' });
  } catch (err) {
    console.error('MongoDB error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};
```

---

**Make sure your folder structure looks like this:**
```
portfolio/
├── api/
│   └── contact.js   ← paste here
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── vercel.json
└── package.json