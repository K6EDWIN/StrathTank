require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./middleware/passport');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
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
  res.sendFile(path.join(__dirname, 'frontend', 'Homepage.html'));
});

app.use('/styles', express.static(path.join(__dirname, 'frontend', 'styles')));
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets')));
app.use('/scripts', express.static(path.join(__dirname, 'frontend', 'scripts')));

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'Registration.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'Login.html'));
  
});
app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'forgotpassword.html')); 
  });
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'resetpassword.html'));
  
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

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = results[0];

    // Check if it's a social login (e.g., password is NULL)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was registered via Google or another social login. Please log in using that method.',
      });
    }

    // If password exists, continue with bcrypt compare
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Bcrypt error:', err);
        return res.status(500).json({ success: false, message: 'Error checking password' });
      }

      if (isMatch) {
        return res.json({ success: true, message: 'Login successful' });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    });
  });
});


//forgot password
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const findUserQuery = 'SELECT * FROM Users WHERE email = ?';
  db.query(findUserQuery, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('User not found.');
    }

    const updateCodeQuery = 'UPDATE Users SET reset_code = ? WHERE email = ?';
    db.query(updateCodeQuery, [resetCode, email], (err) => {
      if (err) return res.status(500).send('Error saving reset code.');

      // Send email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${resetCode}`
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) return res.status(500).send('Email failed to send.');

        // redirect user to reset-password form
        res.redirect(`/reset-password?email=${encodeURIComponent(email)}`);
      });
    });
  });
});
//set new password
app.post('/reset-password', async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  const findQuery = 'SELECT * FROM Users WHERE email = ? AND reset_code = ?';
  db.query(findQuery, [email, resetCode], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).send('Invalid reset code or email.');
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateQuery = 'UPDATE Users SET password = ?, reset_code = NULL WHERE email = ?';
      db.query(updateQuery, [hashedPassword, email], (err) => {
        if (err) return res.status(500).send('Failed to reset password.');
        res.send('Password successfully reset!');
      });
    } catch (error) {
      res.status(500).send('Server error.');
    }
  });
});

//google authentication
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    if (req.user._isNewUser) {
      res.redirect('/signup?showRoleModal=true');
    } else {
      res.redirect('/dashboard');
    }
  }
);
app.post('/set-role', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { role } = req.body;
  const userId = req.user.id;

  const sql = 'UPDATE Users SET role = ? WHERE id = ?';
  db.query(sql, [role, userId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB error' });
    }
    res.json({ message: 'Role updated' });
  });
});

//github signup
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    if (req.user._isNewUser) {
      res.redirect('/signup?showRoleModal=true');
    } else {
      res.redirect('/dashboard'); // or homepage
    }
  }
);


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
