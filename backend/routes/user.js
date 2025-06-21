const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const transporter = require('../config/mailer');
const upload = require('../config/multer');
// POST /user/submit
router.post('/submit', async (req, res) => {
  const { username, email, password, role } = req.body;
  db.query('SELECT * FROM Users WHERE name = ? OR email = ?', [username, email], async (err, results) => {
    if (results.length > 0) return res.status(409).json({ success: false, message: 'Account exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000);

    db.query(`INSERT INTO Users (name, email, password, role, verification_code, verified) VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, role, code, false],
      err => {
        if (err) return res.status(500).json({ success: false });

        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Strathtank Verification Code',
          text: `Hi ${username}, your verification code is: ${code}`
        }, error => {
          if (error) return res.status(500).json({ success: false });
        
res.status(200).json({
  success: true,
  message: "Registration successful. Please verify your email.",
  redirect: `/verify-email?email=${encodeURIComponent(email)}`
});


        });
      });
  });
});

// POST /user/verify
router.post('/verify', (req, res) => {
  const { email, verificationCode } = req.body;

  db.query(
    'SELECT * FROM Users WHERE email = ? AND verification_code = ?',
    [email, verificationCode],
    (err, results) => {
      if (err) return res.status(500).json({ success: false });

      if (results.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid verification code' });
      }

      const user = results[0];

      db.query(
        'UPDATE Users SET verified = true, verification_code = NULL WHERE email = ?',
        [email],
        err => {
          if (err) return res.status(500).json({ success: false });

          // ✅ Automatically log the user in by saving to session
          req.session.user = user;

          res.json({ success: true, message: 'Verification successful' });
        }
      );
    }
  );
});


// POST /user/resend-code
router.post('/resend-code', (req, res) => {
  const { email } = req.body;
  db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
    if (!results.length || results[0].verified) return res.status(400).json({ success: false });

    const newCode = Math.floor(100000 + Math.random() * 900000);
    db.query('UPDATE Users SET verification_code = ? WHERE email = ?', [newCode, email], err => {
      if (err) return res.status(500).json({ success: false });

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verification Code',
        text: `Your new code: ${newCode}`
      }, error => {
        if (error) return res.status(500).json({ success: false });
        res.json({ success: true });
      });
    });
  });
});

// POST /user/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
    if (!results.length) return res.status(401).json({ success: false });

    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (!isMatch) return res.status(401).json({ success: false });
      req.session.user = results[0];
      res.json({ success: true });
    });
  });
});

// POST /user/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  db.query('UPDATE Users SET reset_code = ? WHERE email = ?', [code, email], err => {
    if (err) return res.status(500).send();

    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code',
      text: `Your code is: ${code}`
    }, error => {
      if (error) return res.status(500).send();
      res.redirect(`/reset-password?email=${encodeURIComponent(email)}`);
    });
  });
});

// POST /user/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  const hashed = await bcrypt.hash(newPassword, 10);
  db.query('UPDATE Users SET password = ?, reset_code = NULL WHERE email = ? AND reset_code = ?', [hashed, email, resetCode], err => {
    if (err) return res.status(500).send();
    res.send('Password reset.');
  });
});

// POST /user/set-role
router.post('/set-role', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });

  const { role } = req.body;
  db.query('UPDATE Users SET role = ? WHERE id = ?', [role, req.user.id], err => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json({ message: 'Role updated' });
  });
});

// ✅ POST /api/projects/:id/comment
router.post('/projects/:id/comment', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const user_id = req.session.user.id;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const sql = `
    INSERT INTO comments (project_id, user_id, comment, created_at)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(sql, [id, user_id, content], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Comment added successfully' });
  });
});


// ✅ POST /api/projects/:id/like
router.post('/projects/:id/like', (req, res) => {
  const { id } = req.params;
  const user = req.session.user;

  if (!user || !user.id) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const user_id = user.id;

  const checkSql = 'SELECT * FROM likes WHERE user_id = ? AND project_id = ?';
  db.query(checkSql, [user_id, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error during check' });

    if (results.length > 0) {
      // 🔁 Already liked → unlike it
      const deleteSql = 'DELETE FROM likes WHERE user_id = ? AND project_id = ?';
      db.query(deleteSql, [user_id, id], (err) => {
        if (err) return res.status(500).json({ error: 'DB error during unlike' });

        db.query('SELECT COUNT(*) AS like_count FROM likes WHERE project_id = ?', [id], (err, results) => {
          if (err) return res.status(500).json({ error: 'Failed to get updated like count' });
          res.json({ newLikeCount: results[0].like_count, liked: false });
        });
      });

    } else {
      // ❤️ Not liked yet → like it
      const insertSql = 'INSERT INTO likes (user_id, project_id) VALUES (?, ?)';
      db.query(insertSql, [user_id, id], (err) => {
        if (err) return res.status(500).json({ error: 'DB error during like' });

        db.query('SELECT COUNT(*) AS like_count FROM likes WHERE project_id = ?', [id], (err, results) => {
          if (err) return res.status(500).json({ error: 'Failed to get updated like count' });
          res.json({ newLikeCount: results[0].like_count, liked: true });
        });
      });
    }
  });
});

// ✅ POST /user/upload-project
router.post(
  '/upload-project',
  upload.fields([
    { name: 'project_profile_picture', maxCount: 1 },
    { name: 'screenshots[]', maxCount: 10 },
    { name: 'documents[]', maxCount: 10 }
  ]),
  (req, res) => {
    try {
      console.log("Files:", req.files);
      console.log("Body:", req.body);

      const {
        user_id, title, Short_description, project_lead, description,
        tags, launch_date, status, team_size, project_type,
        category = "General", version = "1.0", technical_details
      } = req.body;

      // 🧠 Format the technical_details based on project type
      let formattedTechnicalDetails = '';
      const details = technical_details.split(' | ');

      if (project_type === 'it') {
        formattedTechnicalDetails =
          `Programming: ${details[0] || 'N/A'}\n` +
          `Frameworks: ${details[1] || 'N/A'}\n` +
          `Database: ${details[2] || 'N/A'}\n` +
          `Deployment: ${details[3] || 'N/A'}`;
      } else {
        formattedTechnicalDetails =
          `Project Focus: ${details[0] || 'N/A'}\n` +
          `Methodology: ${details[1] || 'N/A'}\n` +
          `Target Beneficiaries: ${details[2] || 'N/A'}\n` +
          `Impact Goals: ${details[3] || 'N/A'}`;
      }

      const project = {
        user_id,
        title,
        short_description: Short_description,
        project_lead,
        description,
        tags,
        launch_date,
        status,
        team_size,
        project_type,
        category,
        version,
        technical_details: formattedTechnicalDetails,
        project_profile_picture: req.files?.['project_profile_picture']?.[0]?.path || null,
        screenshots: req.files?.['screenshots[]']?.map(f => f.path).join(',') || null,
        documents: req.files?.['documents[]']?.map(f => f.path).join(',') || null,
        created_at: new Date()
      };

      db.query('INSERT INTO projects SET ?', project, (err, results) => {
        if (err) {
          console.error("❌ Upload error:", err);
          return res.status(500).json({ success: false, message: "Upload failed", error: err.message });
        }

        return res.json({ success: true, message: "✅ Project uploaded successfully!" });
      });
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      res.status(500).json({ success: false, message: "Unexpected error", error: err.message });
    }
  }
);


module.exports = router;
