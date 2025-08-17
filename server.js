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
});

// 2. Create an Express app
const app = express();

// 3. Middleware setup
app.use(cors());            // allow cross-origin requests
app.use(express.json());    // parse JSON bodies automatically

// 4. Define a test route
app.get('/', (req, res) => {
  res.send('Hello World from Express!');
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

    // uses the client you created earlier: `const mailgunClient = mailgun.client({...})`
    const response = await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Playground <mailgun@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      html
    });

    return res.status(200).json({ ok: true, id: response.id, message: response.message });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to send" });
  }
});

// 5. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});