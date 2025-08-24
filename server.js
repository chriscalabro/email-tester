// 1. Import the required packages
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // loads .env file into process.env
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mailgunClient = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  // If your Mailgun domain is in the EU region, uncomment the next line:
  // url: 'https://api.eu.mailgun.net',
});

// 2. Create an Express app
const app = express();

// 3. Middleware setup
app.use(cors());            // allow cross-origin requests
app.use(express.json());    // parse JSON bodies automatically
app.use(express.static('.'));  // serve static files from current directory

// 4. Define a test route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Send email (Mailgun)
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject = 'Test email', html } = req.body || {};
    if (!to || !html) {
      return res.status(400).json({ error: "Missing 'to' or 'html' field." });
    }
    if (!process.env.MAILGUN_DOMAIN) {
      return res.status(500).json({ error: "Server missing MAILGUN_DOMAIN (set it in .env)." });
    }

    const domain = process.env.MAILGUN_DOMAIN;
    const from = `Playground <mail@mailgun.chriscalabro.com>`; // hard-coded as requested

    // small log so you can verify what's used each send
    console.log('[send-email]', { domain, from, to, subject });

    const response = await mailgunClient.messages.create(domain, {
      from,
      to,
      subject,
      html,
    });

    return res.status(200).json({ ok: true, id: response.id, message: response.message });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Failed to send' });
  }
});

// 5. Export the app for Vercel
module.exports = app;