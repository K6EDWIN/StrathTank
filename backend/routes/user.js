const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const transporter = require('../config/mailer');
const upload = require('../config/multer');

// ----------------------------------------
// POST /user/submit - Register User
// ----------------------------------------
router.post('/submit', async (req, res) => {
  const { username, email, password, role } = req.body;

  db.query(
    'SELECT * FROM Users WHERE name = ? OR email = ?',
    [username, email],
    async (err, results) => {
      if (results.length > 0) {
        return res.status(409).json({ success: false, message: 'Account exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const code = Math.floor(100000 + Math.random() * 900000);

      db.query(
        'INSERT INTO Users (name, email, password, role, verification_code, verified) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, code, false],
        (err) => {
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
        }
      );
    }
  );
});

// ----------------------------------------
// POST /user/verify - Email Verification
// ----------------------------------------
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
        (err) => {
          if (err) return res.status(500).json({ success: false });

          req.session.user = user;
          res.json({ success: true, message: 'Verification successful' });
        }
      );
    }
  );
});

// ----------------------------------------
// POST /user/resend-code
// ----------------------------------------
router.post('/resend-code', (req, res) => {
  const { email } = req.body;

  db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
    if (!results.length || results[0].verified) {
      return res.status(400).json({ success: false });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000);

    db.query('UPDATE Users SET verification_code = ? WHERE email = ?', [newCode, email], (err) => {
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

// ----------------------------------------
// POST /user/login
// ----------------------------------------
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
    if (!results.length) return res.status(401).json({ success: false });

    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (!isMatch) return res.status(401).json({ success: false });

      req.session.user = results[0];

      // ✅ Force session to be saved before sending response
      req.session.save(err => {
        if (err) return res.status(500).json({ success: false, message: 'Session save failed' });
        res.json({ success: true });
      });
    });
  });
});


// ----------------------------------------
// POST /user/forgot-password
// ----------------------------------------
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  db.query('UPDATE Users SET reset_code = ? WHERE email = ?', [code, email], (err) => {
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

// ----------------------------------------
// POST /user/reset-password
// ----------------------------------------
router.post('/reset-password', async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  const hashed = await bcrypt.hash(newPassword, 10);

  db.query('UPDATE Users SET password = ?, reset_code = NULL WHERE email = ? AND reset_code = ?', [hashed, email, resetCode], (err) => {
    if (err) return res.status(500).send();
    res.send('Password reset.');
  });
});

// ----------------------------------------
// POST /user/set-role
// ----------------------------------------
router.post('/set-role', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { role } = req.body;
  db.query('UPDATE Users SET role = ? WHERE id = ?', [role, req.user.id], (err) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json({ message: 'Role updated' });
  });
});

// ----------------------------------------
// POST /user/upload-project
// ----------------------------------------
router.post(
  '/upload-project',
  upload.fields([
    { name: 'project_profile_picture', maxCount: 1 },
    { name: 'screenshots[]', maxCount: 10 },
    { name: 'documents[]', maxCount: 10 }
  ]),
  (req, res) => {
    console.log("🚀 Upload project request received");

    if (!req.session?.user?.id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user_id = req.session.user.id;

    try {
      const {
        title,
        Short_description,
        project_lead,
        description,
        tags,
        launch_date,
        status,
        team_size,
        project_type,
        category,
        version = "1.0",
        technical_details,
        repo_url,
        stars,
        forks
      } = req.body;

      console.log("Form data received:", {
        title,
        Short_description,
        project_lead,
        description,
        tags,
        launch_date,
        status,
        team_size,
        project_type,
        category,
        version,
        technical_details,
        repo_url,
        stars,
        forks
      });

      // Format technical details
      const details = technical_details ? technical_details.split(' | ') : [];
      let formattedTechnicalDetails = '';

      if (project_type === 'it') {
        formattedTechnicalDetails = `
Programming: ${details[0] || 'N/A'}
Frameworks: ${details[1] || 'N/A'}
Database: ${details[2] || 'N/A'}
Deployment: ${details[3] || 'N/A'}`;
      } else {
        formattedTechnicalDetails = `
Project Focus: ${details[0] || 'N/A'}
Methodology: ${details[1] || 'N/A'}
Target Beneficiaries: ${details[2] || 'N/A'}
Impact Goals: ${details[3] || 'N/A'}`;
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
        category: Array.isArray(category) ? category.join(', ') : category,
        version,
        technical_details: formattedTechnicalDetails,
        project_profile_picture: req.files?.['project_profile_picture']?.[0]?.path || null,
        screenshots: req.files?.['screenshots[]']?.map(f => f.path).join(',') || null,
        documents: req.files?.['documents[]']?.map(f => f.path).join(',') || null,
        created_at: new Date()
      };

      console.log("Prepared project object to insert:", project);

      // Insert project into DB
      db.query('INSERT INTO projects SET ?', project, (err, result) => {
        if (err) {
          console.error("❌ Project insert error:", err);
          return res.status(500).json({ success: false, message: "Upload failed", error: err.message });
        }

        const projectId = result.insertId;
        console.log(`✅ Project inserted with ID: ${projectId}`);

        // Function to insert team members and respond
        function insertTeamMembersAndRespond() {
          const teamIdsRaw = req.body.team_ids;
          const teamRolesRaw = req.body.team_roles;

          const teamIds = Array.isArray(teamIdsRaw) ? teamIdsRaw : teamIdsRaw ? [teamIdsRaw] : [];
          const teamRoles = Array.isArray(teamRolesRaw) ? teamRolesRaw : teamRolesRaw ? [teamRolesRaw] : [];

          console.log("Team IDs received:", teamIds);
          console.log("Team Roles received:", teamRoles);

          const memberInserts = [];

          teamIds.forEach((uid, i) => {
            const role = teamRoles[i] || 'Member';
            memberInserts.push([projectId, uid, role]);
          });

          if (memberInserts.length > 0) {
            const sql = `INSERT INTO project_team_members (project_id, user_id, role) VALUES ?`;
            db.query(sql, [memberInserts], (err) => {
              if (err) {
                console.error("❌ Team insert error:", err);
                return res.status(500).json({
                  success: false,
                  message: "Project saved but team insert failed",
                  error: err.message
                });
              }
              console.log(`✅ Team members inserted for project ID ${projectId}`);
              return res.json({ success: true, message: "✅ Project and team saved!" });
            });
          } else {
            console.log("No team members to insert");
            return res.json({ success: true, message: "✅ Project saved (no team members added)" });
          }
        }

        // Insert GitHub metadata if it's an IT project and repo_url is provided
        if (project_type === 'it' && repo_url?.trim()) {
          const githubMetadata = {
            project_id: projectId,
            repo_url: repo_url.trim(),
            stars: parseInt(stars) || 0,
            forks: parseInt(forks) || 0,
            last_synced_at: new Date()
          };

          db.query('INSERT INTO github_metadata SET ?', githubMetadata, (err) => {
            if (err) {
              console.error("❌ GitHub metadata insert error:", err);
            } else {
              console.log("✅ GitHub metadata inserted successfully");
            }
            insertTeamMembersAndRespond();
          });
        } else {
          insertTeamMembersAndRespond();
        }
      });

    } catch (err) {
      console.error("❌ Unexpected error:", err);
      res.status(500).json({ success: false, message: "Unexpected error", error: err.message });
    }
  }
);





// ----------------------------------------
// GET /user/search - Autocomplete User Search
// ----------------------------------------
router.get('/search', (req, res) => {
  const q = req.query.q;

  if (!q || q.trim() === '') {
    return res.status(400).json({ error: 'Query required' });
  }

  const sql = `
    SELECT id, name, profile_image AS profile_photo, role
    FROM users
    WHERE name LIKE ?
    ORDER BY name
    LIMIT 6
  `;

  db.query(sql, [`%${q}%`], (err, results) => {
    if (err) {
      console.error("User search error:", err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
});
// ----------------------------------------
// ✅ GET /user - return logged in user (session or passport)
// ----------------------------------------
router.get('/', (req, res) => {
  if (!req.session?.user) {
    if (req.user) {
      // Passport user fallback
      return res.json({
        success: true,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role || 'student',
          profile_image: req.user.profile_image || '/assets/noprofile.jpg',
     bio: (user.Bio && user.Bio.trim()) ? user.Bio.trim() : 'No bio yet.',


          skills: req.user.skills || ''
        }
      });
    }
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }

  const userId = req.session.user.id;

  db.query('SELECT * FROM Users WHERE id = ?', [userId], (err, results) => {
    if (err || results.length === 0) {
      console.error('❌ Error loading user:', err);
      return res.status(500).json({ success: false, message: 'Failed to load user' });
    }

    const user = results[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email || '',
        role: user.role || 'student',
        profile_image: user.profile_image || '/assets/noprofile.jpg',
      bio: (user.Bio && user.Bio.trim()) ? user.Bio.trim() : 'No bio yet.',

        skills: user.skills || ''
      }
    });
  });
});



// --------------------------------------
// PUT /user/skills - Update skills from session
// ----------------------------------------
router.put('/skills', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const userId = user.id;
  const { skills } = req.body;

  if (!Array.isArray(skills)) {
    return res.status(400).json({ success: false, message: 'Skills must be an array' });
  }

  const skillsString = skills.join(','); // or JSON.stringify(skills) if using JSON column

  db.query('UPDATE Users SET skills = ? WHERE id = ?', [skillsString, userId], (err) => {
    if (err) {
      console.error('❌ Skill update error:', err);
      return res.status(500).json({ success: false, message: 'DB error' });
    }

    res.json({ success: true, message: 'Skills updated successfully' });
  });
});


// ----------------------------------------
// PUT /user/bio - Update Bio
// ----------------------------------------
router.put('/bio', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const userId = user.id;
  const { bio } = req.body;

  if (typeof bio !== 'string' || bio.length > 1000) {
    return res.status(400).json({ success: false, message: 'Invalid bio input' });
  }

  db.query('UPDATE Users SET bio = ? WHERE id = ?', [bio, userId], (err) => {
    if (err) {
      console.error('❌ Bio update error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // Update session too
    req.session.user.bio = bio;
    res.json({ success: true, message: 'Bio updated successfully', bio });
  });
});

//edit profile picture
router.post('/profile-picture', upload.single('profile_picture'), (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }

  const userId = req.session.user.id;
  const imagePath = req.file.path.replace(/\\/g, '/'); 

  db.query(
    'UPDATE Users SET profile_image = ? WHERE id = ?',
    [imagePath, userId],
    (err) => {
      if (err) {
        console.error('❌ Could not update profile image:', err);
        return res.status(500).json({ success: false, message: 'Could not update image' });
      }

      req.session.user.profile_image = imagePath;
      res.json({ success: true, imagePath });
    }
  );
});
// ----------------------------------------
// POST /user/flag-project - Flag a project for admin review
// ----------------------------------------
router.post('/flag-project', (req, res) => {
  const user = req.session?.user;
  const { project_id, name, reason } = req.body;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  if (!project_id || !name || !reason) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO FlaggedProjects (project_id, name, flagged_by, flag_reason)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [project_id, name, user.id, reason], (err) => {
    if (err) {
      console.error('❌ Error flagging project:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: 'Project flagged for review' });
  });
});
// ----------------------------------------
// GET /user/logout - Logout user
// ----------------------------------------
// ----------------------------------------
// ✅ GET /user/logout - Destroy session and logout
// ----------------------------------------
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }

    req.session.destroy(err => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).send('Could not destroy session');
      }

      res.clearCookie('connect.sid', { path: '/' });
      res.redirect('/');
    });
  });
});


// ----------------------------------------
// Mentorship Features for Users
// ----------------------------------------
const ensureUser = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
};


// ✅ GET /user/mentorship/dashboard
router.get('/mentorship/dashboard', ensureUser, (req, res) => {
  const userId = req.session.user.id;

  const sql = `
    SELECT * FROM mentorship_requests
    WHERE mentee_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('❌ DB error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, mentorshipRequests: results });
  });
});


// ✅ GET /user/mentorship/request/:id/messages


router.get('/mentorship/request/:id/messages', ensureUser, (req, res) => {
  const userId = req.session.user.id;
  const requestId = req.params.id;
  const sql = `
    SELECT * FROM mentorship_requests
    WHERE id = ? AND mentee_id = ?
  `;

  db.query(sql, [requestId, userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).json({ success: false, message: 'Not your request' });
    }

    // ✅ Now fetch messages
    db.query(
      `SELECT * FROM mentorship_messages WHERE request_id = ? ORDER BY created_at ASC`,
      [requestId],
      (err, messages) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'DB error' });
        }
        res.json({ success: true, messages });
      }
    );
  });
});



// ✅ POST /user/mentorship/request/:id/messages
router.post('/mentorship/request/:id/messages', ensureUser, (req, res) => {
  const requestId = req.params.id;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message cannot be empty' });
  }

  const sql = `
    INSERT INTO mentorship_messages (request_id, sender, message, created_at)
    VALUES (?, 'mentee', ?, NOW())
  `;

  db.query(sql, [requestId, message.trim()], (err) => {
    if (err) {
      console.error('❌ DB error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: 'Message sent' });
  });
});





module.exports = router;
