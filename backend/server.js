const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const nodemailer = require('nodemailer');

// Load environment variables from .env or fp.env
try {
  const dotenv = require('dotenv');
  const fs = require('fs');

  const envPath = path.join(__dirname, '.env');
  const fpEnvPath = path.join(__dirname, 'fp.env');

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else if (fs.existsSync(fpEnvPath)) {
    dotenv.config({ path: fpEnvPath });
    console.log('📧 Loaded email configuration from fp.env');
  }
} catch (e) {
  // dotenv not installed
}

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    password TEXT NOT NULL,
    userType TEXT NOT NULL CHECK(userType IN ('farmer', 'consumer')),
    farmName TEXT,
    crops TEXT,
    farmSize TEXT,
    preferences TEXT,
    deliveryAddress TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1Email TEXT NOT NULL,
    user2Email TEXT NOT NULL,
    lastMessage TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversationId INTEGER NOT NULL,
    senderEmail TEXT NOT NULL,
    message TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversationId) REFERENCES conversations(id)
  )`);
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  console.log('📝 Signup request received:', { email: req.body.email, userType: req.body.userType });
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      password,
      userType,
      farmName,
      crops,
      farmSize,
      preferences,
      deliveryAddress
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !location || !password || !userType) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (userType !== 'farmer' && userType !== 'consumer') {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    db.get('SELECT email, phone FROM users WHERE email = ? OR phone = ?', [email, phone], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (row) {
        if (row.email === email) return res.status(400).json({ error: 'Email already registered' });
        if (row.phone === phone) return res.status(400).json({ error: 'Phone already registered' });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: 'Error hashing password' });

        const userData = {
          firstName,
          lastName,
          email,
          phone,
          location,
          password: hashedPassword,
          userType,
          farmName: userType === 'farmer' ? farmName : null,
          crops: userType === 'farmer' && crops ? crops.join(', ') : null,
          farmSize: userType === 'farmer' ? farmSize : null,
          preferences: userType === 'consumer' && preferences ? preferences.join(', ') : null,
          deliveryAddress: userType === 'consumer' ? deliveryAddress : null
        };

        db.run(
          `INSERT INTO users (firstName, lastName, email, phone, location, password, userType, farmName, crops, farmSize, preferences, deliveryAddress)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userData.firstName,
            userData.lastName,
            userData.email,
            userData.phone,
            userData.location,
            userData.password,
            userData.userType,
            userData.farmName,
            userData.crops,
            userData.farmSize,
            userData.preferences,
            userData.deliveryAddress
          ],
          function(err) {
            if (err) return res.status(500).json({ error: 'Error creating user account' });

            const userId = this.lastID;
            db.get(
              'SELECT id, firstName, lastName, email, phone, location, userType, farmName, crops, farmSize, preferences, deliveryAddress FROM users WHERE id = ?',
              [userId],
              (err, user) => {
                if (err) return res.status(500).json({ error: 'Error retrieving user data' });
                console.log('✅ User created successfully:', { id: user.id, email: user.email });
                res.status(201).json({ message: 'User created successfully', user });
              }
            );
          }
        );
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  console.log('🔐 Login request received for:', req.body.email);
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return res.status(500).json({ error: 'Error verifying password' });
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        const { password: _, ...userData } = user;
        console.log('✅ Login successful for:', email);
        res.json({ message: 'Login successful', user: userData });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user by ID
app.get('/api/user/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    'SELECT id, firstName, lastName, email, phone, location, userType, farmName, crops, farmSize, preferences, deliveryAddress FROM users WHERE id = ?',
    [id],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    }
  );
});

// Email transporter setup
const getEmailTransporter = () => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass || smtpUser === 'your-email@gmail.com' || smtpPass === 'your-app-password') {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass }
  });
};

const transporter = getEmailTransporter();
if (!transporter) {
  console.log('⚠️  Email not configured. Forgot password feature will not work.');
} else {
  console.log('✅ Email configured successfully');
}

// Forgot password
app.post('/api/forgot-password', (req, res) => {
  console.log('🔑 Forgot password request received for:', req.body.email);
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(200).json({ message: 'If the email exists, a password has been sent.' });

      const generatePassword = () => {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
        for (let i = password.length; i < length; i++) {
          password += charset[Math.floor(Math.random() * charset.length)];
        }
        return password.split('').sort(() => Math.random() - 0.5).join('');
      };

      const newPassword = generatePassword();
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: 'Error processing password' });

        db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (err) => {
          if (err) return res.status(500).json({ error: 'Error updating password' });

          const mailOptions = {
            from: process.env.SMTP_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Farmified - Your Password',
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2e7d32;">Farmified Password Recovery</h2>
              <p>Hello ${user.firstName},</p>
              <p>Your new password:</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="font-size: 18px; font-weight: bold; color: #2e7d32; margin: 0;">${newPassword}</p>
              </div>
              <p>Please change it after logging in.</p>
            </div>`,
            text: `Hello ${user.firstName},\nYour new password: ${newPassword}`
          };

          const emailTransporter = getEmailTransporter();
          if (!emailTransporter) return res.status(500).json({ error: 'Email service is not configured.' });

          emailTransporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).json({ error: 'Failed to send email: ' + error.message });
            console.log('✅ Password email sent:', info.messageId);
            res.json({ message: 'Password has been sent to your email address.' });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running!' });
});

// Get user by email
app.get('/api/user/email/:email', (req, res) => {
  const { email } = req.params;
  db.get('SELECT id, firstName, lastName, email, userType FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });
});

// Get all conversations for a user
app.get('/api/conversations/:email', (req, res) => {
  const { email } = req.params;
  db.all(
    `SELECT * FROM conversations WHERE user1Email = ? OR user2Email = ? ORDER BY updatedAt DESC`,
    [email, email],
    (err, conversations) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ conversations });
    }
  );
});

// Get messages for a conversation
app.get('/api/messages/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  db.all('SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC', [conversationId], (err, messages) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ messages });
  });
});

// Send a message
app.post('/api/messages/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const { senderEmail, message } = req.body;
  if (!senderEmail || !message) return res.status(400).json({ error: 'Missing fields' });

  db.run(`INSERT INTO messages (conversationId, senderEmail, message) VALUES (?, ?, ?)`, [conversationId, senderEmail, message], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });

    db.run(`UPDATE conversations SET lastMessage = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [message, conversationId], (err) => {
      if (err) console.error(err);
      res.json({ id: this.lastID, conversationId, senderEmail, message });
    });
  });
});

// Create or get existing conversation
app.post('/api/conversations', (req, res) => {
  const { user1Email, user2Email } = req.body;
  if (!user1Email || !user2Email) return res.status(400).json({ error: 'Emails required' });

  db.get(
    `SELECT * FROM conversations WHERE (user1Email = ? AND user2Email = ?) OR (user1Email = ? AND user2Email = ?)`,
    [user1Email, user2Email, user2Email, user1Email],
    (err, conv) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (conv) return res.json({ conversation: conv });

      db.run(`INSERT INTO conversations (user1Email, user2Email, lastMessage) VALUES (?, ?, '')`, [user1Email, user2Email], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to create conversation' });
        db.get('SELECT * FROM conversations WHERE id = ?', [this.lastID], (err, newConv) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.json({ conversation: newConv });
        });
      });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Database at: ${dbPath}`);
  console.log(`💡 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error(err.message);
    console.log('Database connection closed.');
    process.exit(0);
  });
});
