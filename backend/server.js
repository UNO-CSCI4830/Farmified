const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const nodemailer = require('nodemailer');

// Load environment variables from .env file if dotenv is installed
try {
  const dotenv = require('dotenv');
  const fs = require('fs');
  
  // Try to load .env first, then fp.env as fallback
  const envPath = path.join(__dirname, '.env');
  const fpEnvPath = path.join(__dirname, 'fp.env');
  
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else if (fs.existsSync(fpEnvPath)) {
    dotenv.config({ path: fpEnvPath });
    console.log('📧 Loaded email configuration from fp.env');
  }
} catch (e) {
  // dotenv not installed, that's okay - use environment variables directly
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

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !location || !password || !userType) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate user type
    if (userType !== 'farmer' && userType !== 'consumer') {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Check if email or phone already exists
    db.get('SELECT email, phone FROM users WHERE email = ? OR phone = ?', [email, phone], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        if (row.email === email) {
          return res.status(400).json({ error: 'Email already registered' });
        }
        if (row.phone === phone) {
          return res.status(400).json({ error: 'Phone already registered' });
        }
      }

      // Hash password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ error: 'Error hashing password' });
        }

        // Prepare user data
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

        // Insert user into database
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
            if (err) {
              return res.status(500).json({ error: 'Error creating user account' });
            }

            // Return user data (without password)
            const userId = this.lastID;
            db.get('SELECT id, firstName, lastName, email, phone, location, userType, farmName, crops, farmSize, preferences, deliveryAddress FROM users WHERE id = ?', [userId], (err, user) => {
              if (err) {
                console.error('❌ Error retrieving user:', err);
                return res.status(500).json({ error: 'Error retrieving user data' });
              }
              console.log('✅ User created successfully:', { id: user.id, email: user.email });
              res.status(201).json({ message: 'User created successfully', user });
            });
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

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Compare password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Error verifying password' });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Return user data (without password)
        const { password: _, ...userData } = user;
        console.log('✅ Login successful for:', email);
        res.json({ message: 'Login successful', user: userData });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user (for checking authentication status)
app.get('/api/user/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.get('SELECT id, firstName, lastName, email, phone, location, userType, farmName, crops, farmSize, preferences, deliveryAddress FROM users WHERE id = ?', [id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Email transporter setup
// Note: For production, use environment variables for email credentials
// For development, you can use Gmail with App Password or a service like Mailtrap
const getEmailTransporter = () => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  // Check if email is configured
  if (!smtpUser || !smtpPass || smtpUser === 'your-email@gmail.com' || smtpPass === 'your-app-password') {
    return null; // Email not configured
  }
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
};

const transporter = getEmailTransporter();

// Log email configuration status
if (!transporter) {
  console.log('⚠️  Email not configured. Forgot password feature will not work.');
  console.log('📧 To configure email, set environment variables:');
  console.log('   SMTP_USER=your-email@gmail.com');
  console.log('   SMTP_PASS=your-app-password');
  console.log('   SMTP_HOST=smtp.gmail.com (optional)');
  console.log('   SMTP_PORT=587 (optional)');
} else {
  console.log('✅ Email configured successfully');
}

// Forgot password endpoint
app.post('/api/forgot-password', (req, res) => {
  console.log('🔑 Forgot password request received for:', req.body.email);
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        // Don't reveal if email exists or not for security
        return res.status(200).json({ 
          message: 'If the email exists, a password has been sent.' 
        });
      }

      // Generate a new temporary password
      const generatePassword = () => {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        // Ensure at least one of each required character type
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
        password += '0123456789'[Math.floor(Math.random() * 10)]; // number
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special char
        
        for (let i = password.length; i < length; i++) {
          password += charset[Math.floor(Math.random() * charset.length)];
        }
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
      };

      const newPassword = generatePassword();

      // Hash the new password
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error('❌ Error hashing password:', err);
          return res.status(500).json({ error: 'Error processing password' });
        }

        // Update user's password in database
        db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (err) => {
          if (err) {
            console.error('❌ Error updating password:', err);
            return res.status(500).json({ error: 'Error updating password' });
          }

          // Send email with the new password
          const mailOptions = {
            from: process.env.SMTP_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Farmified - Your Password',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2e7d32;">Farmified Password Recovery</h2>
                <p>Hello ${user.firstName},</p>
                <p>You requested to recover your password. Here is your new password:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="font-size: 18px; font-weight: bold; color: #2e7d32; margin: 0;">${newPassword}</p>
                </div>
                <p>Please use this password to sign in. We recommend changing your password after logging in.</p>
                <p>If you did not request this password reset, please contact support immediately.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">This is an automated message from Farmified.</p>
              </div>
            `,
            text: `
              Farmified Password Recovery
              
              Hello ${user.firstName},
              
              You requested to recover your password. Here is your new password:
              
              ${newPassword}
              
              Please use this password to sign in. We recommend changing your password after logging in.
              
              If you did not request this password reset, please contact support immediately.
              
              This is an automated message from Farmified.
            `
          };

          const emailTransporter = getEmailTransporter();
          
          if (!emailTransporter) {
            console.error('❌ Email not configured');
            return res.status(500).json({ 
              error: 'Email service is not configured. Please contact the administrator.' 
            });
          }

          emailTransporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('❌ Error sending email:', error);
              
              // Provide more specific error messages
              let errorMessage = 'Failed to send email. ';
              if (error.code === 'EAUTH') {
                errorMessage += 'Email authentication failed. Please check your email credentials. ';
                errorMessage += 'For Gmail, you need to use an App Password (not your regular password). ';
                errorMessage += 'See: https://support.google.com/accounts/answer/185833';
              } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
                errorMessage += 'Could not connect to email server. Please check your internet connection and SMTP settings.';
              } else {
                errorMessage += error.message || 'Please check email configuration.';
              }
              
              return res.status(500).json({ 
                error: errorMessage
              });
            }

            console.log('✅ Password email sent successfully:', info.messageId);
            res.json({ 
              message: 'Password has been sent to your email address.' 
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test route to verify server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Database will be created at: ${dbPath}`);
  console.log(`💡 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

