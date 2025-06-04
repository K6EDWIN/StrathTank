require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB connection error:', err.message);
  } else {
    console.log('✅ Connected to database');
  }
});

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Serve frontend files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'Registration.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'Registration.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'Login.html'));
});
app.get('/scripts/login.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'scripts', 'login.js'));
});
app.get('/scripts/verify.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'scripts', 'verify.js'));
});

app.get('/verify-email', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'Verify.html'));
});

// Register with verification email
app.post('/submit', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const checkQuery = `SELECT * FROM Users WHERE name = ? OR email = ?`;
    db.query(checkQuery, [username, email], async (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error checking user' });
      }

      if (results.length > 0) {
        return res.status(409).json({ success: false, message: 'Account already exists. Please sign in.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      const insertQuery = `
        INSERT INTO Users (name, email, password, role, verification_code, verified)
        VALUES (?, ?, ?, ?, ?, ?)`;

      db.query(insertQuery, [username, email, hashedPassword, role, verificationCode, false], (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error saving user' });
        }

        // Send verification email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Strathtank Verification Code',
          text: `Hi ${username},\n\nYour Strathtank verification code is: ${verificationCode}`
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            return res.status(500).json({ success: false, message: 'Failed to send verification email.' });
          }

          return res.redirect(`/verify-email?email=${encodeURIComponent(email)}`);
        });
      });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unexpected error' });
  }
});

// Verify code
app.post('/verify', (req, res) => {
  const { email, verificationCode } = req.body;

  const query = `SELECT * FROM Users WHERE email = ? AND verification_code = ?`;
  db.query(query, [email, verificationCode], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Verification failed.' });

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid code or email.' });
    }

    const updateQuery = `UPDATE Users SET verified = true, verification_code = NULL WHERE email = ?`;
    db.query(updateQuery, [email], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to update user verification.' });

      return res.status(200).json({ success: true, message: 'Email verified. You may now log in.' });
    });
  });
});

// Resend code
app.post('/resend-code', (req, res) => {
  const { email } = req.body;

  const checkQuery = `SELECT * FROM Users WHERE email = ?`;
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error.' });

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found for this email.' });
    }

    const user = results[0];
    if (user.verified) {
      return res.status(400).json({ success: false, message: 'This account is already verified.' });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000);
    const updateQuery = `UPDATE Users SET verification_code = ? WHERE email = ?`;

    db.query(updateQuery, [newCode, email], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to update code.' });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Resent Strathtank Verification Code',
        text: `Hello,\n\nYour new verification code is: ${newCode}`
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) return res.status(500).json({ success: false, message: 'Failed to resend email.' });

        return res.status(200).json({ success: true, message: 'Verification code resent successfully.' });
      });
    });
  });
});

// ✅ LOGIN ROUTE
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM Users WHERE email = ?`;
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Login failed due to server error.' });

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No user found with that email.' });
    }

    const user = results[0];

    if (!user.verified) {
      return res.status(401).json({ success: false, message: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    return res.status(200).json({ success: true, message: 'Login successful.' });
  });
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
