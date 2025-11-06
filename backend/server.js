const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

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

