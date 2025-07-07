// ====================================================
//  1️⃣ IMPORTS & SETUP
// ====================================================
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ====================================================
//  2️⃣ MIDDLEWARE
// ====================================================
function ensureMentor(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'mentor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
}

// ====================================================
//  3️⃣ MENTOR PROFILE & DASHBOARD
// ====================================================

// ✅ GET /mentor/dashboard
router.get('/dashboard', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;

  const mentorQuery = `
    SELECT id, name, email, profile_image, bio 
    FROM Users 
    WHERE id = ?
  `;

  const allProjectsQuery = `
    SELECT 
      id,
      title,
      short_description,
      launch_date,
      project_profile_picture AS image,
      category,
      project_type,
      created_at
    FROM Projects
    WHERE status = 'approved'
    ORDER BY created_at DESC
  `;

  const assignedProjectsQuery = `
    SELECT 
      p.id AS project_id,
      p.title,
      p.short_description,
      p.launch_date,
      p.category,
      p.project_profile_picture AS image,
      p.project_type,
      p.created_at,
      mr.id AS mentorship_request_id,
      mr.subject,
      mr.challenge,
      mr.status
    FROM mentorship_requests mr
    JOIN Projects p ON mr.project_id = p.id
    WHERE mr.mentor_id = ?
      AND p.status = 'approved'
    ORDER BY mr.created_at DESC
  `;

  db.query(mentorQuery, [mentorId], (err, mentorResult) => {
    if (err) {
      console.error('❌ DB error (mentor):', err);
      return res.status(500).json({ success: false });
    }
    if (!mentorResult.length) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    const mentor = mentorResult[0];

    db.query(allProjectsQuery, (err, allProjects) => {
      if (err) {
        console.error('❌ DB error (all projects):', err);
        return res.status(500).json({ success: false });
      }

      db.query(assignedProjectsQuery, [mentorId], (err, assignedProjects) => {
        if (err) {
          console.error('❌ DB error (assigned projects):', err);
          return res.status(500).json({ success: false });
        }

        res.json({
          success: true,
          mentor,
          allProjects,
          assignedProjects
        });
      });
    });
  });
});

// ====================================================
//  4️⃣ BIO MANAGEMENT
// ====================================================

// ✅ PUT /mentor/update-bio
router.put('/update-bio', ensureMentor, (req, res) => {
  const { bio } = req.body;
  const mentorId = req.session.user.id;

  db.query('UPDATE Users SET bio = ? WHERE id = ?', [bio, mentorId], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Bio update failed' });
    }

    req.session.user.bio = bio;
    res.json({ success: true, message: 'Bio updated' });
  });
});

// ====================================================
//  5️⃣ MENTEE MANAGEMENT
// ====================================================

// ✅ GET /mentor/mentees
router.get('/mentees', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;

  const sql = `
    SELECT DISTINCT u.id, u.name, u.email, ptm.role
    FROM project_team_members ptm
    JOIN Users u ON ptm.user_id = u.id
    JOIN Projects p ON ptm.project_id = p.id
    WHERE p.user_id = ?
  `;

  db.query(sql, [mentorId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching mentees:", err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, mentees: results });
  });
});

// ✅ GET /mentor/current-mentees
router.get('/current-mentees', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;

  const sql = `
    SELECT
      u.id AS mentee_id,
      u.name AS mentee_name,
      u.profile_image AS mentee_profile_image,
      p.id AS project_id,
      p.title AS project_title
    FROM mentorship_requests mr
    JOIN Users u ON mr.mentee_id = u.id
    JOIN Projects p ON mr.project_id = p.id
    WHERE mr.mentor_id = ?
      AND mr.status = 'accepted'
    ORDER BY mr.created_at DESC
  `;

  db.query(sql, [mentorId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching current mentees:', err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, mentees: results });
  });
});

// ====================================================
//  6️⃣ MENTORSHIP REQUESTS
// ====================================================

// ✅ GET /mentor/requests
router.get('/requests', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;

  const sql = `
    SELECT mr.*, u.name AS mentee_name, p.title AS project_title, p.project_type
    FROM mentorship_requests mr
    LEFT JOIN Users u ON mr.mentee_id = u.id
    LEFT JOIN Projects p ON mr.project_id = p.id
    WHERE mr.mentor_id = ?
    ORDER BY mr.created_at DESC
  `;

  db.query(sql, [mentorId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching requests:', err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, requests: results });
  });
});

// ✅ GET /mentor/request/:id
router.get('/request/:id', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;
  const requestId = req.params.id;

  const sql = `
    SELECT mr.*, u.name AS mentee_name, p.title AS project_title, p.project_type
    FROM mentorship_request mr
    LEFT JOIN Users u ON mr.mentee_id = u.id
    LEFT JOIN Projects p ON mr.project_id = p.id
    WHERE mr.mentor_id = ? AND mr.id = ?
  `;

  db.query(sql, [mentorId, requestId], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (!results.length) return res.status(404).json({ success: false, message: 'Request not found' });

    res.json({ success: true, request: results[0] });
  });
});

// ✅ POST /mentor/respond
router.post('/respond', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;
  const { requestId, action } = req.body;

  if (!['accepted', 'rejected'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  let sql, params;

  if (action === 'accepted') {
    sql = `
      UPDATE mentorship_requests
      SET status = ?, mentor_id = ?
      WHERE id = ? AND (mentor_id IS NULL OR mentor_id = 0) AND status = 'pending'
    `;
    params = [action, mentorId, requestId];
  } else {
    sql = `
      UPDATE mentorship_requests
      SET status = ?
      WHERE id = ? AND mentor_id = ?
    `;
    params = [action, requestId, mentorId];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('❌ Error updating request status:', err);
      return res.status(500).json({ success: false });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not assign request. It may already be assigned.'
      });
    }

    res.json({ success: true, message: `Request ${action}` });
  });
});

// ✅ POST /mentor/feedback
router.post('/feedback', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;
  const { requestId, feedback } = req.body;

  const sql = `
    UPDATE mentorship_requests SET feedback = ?
    WHERE id = ? AND mentor_id = ?
  `;

  db.query(sql, [feedback, requestId, mentorId], (err) => {
    if (err) {
      console.error('❌ Error submitting feedback:', err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, message: 'Feedback submitted' });
  });
});

// ✅ GET /mentor/request-pool
router.get('/request-pool', ensureMentor, (req, res) => {
  const sql = `
    SELECT 
      mr.id AS mentorship_request_id,
      mr.subject,
      mr.challenge,
      mr.status,
      mr.created_at AS request_created_at,
      p.id AS project_id,
      p.title,
      p.short_description,
      p.project_profile_picture AS image,
      p.category,
      p.project_type,
      p.created_at AS project_created_at
    FROM mentorship_requests mr
    JOIN Projects p ON mr.project_id = p.id
    WHERE mr.status = 'pending' AND mr.mentor_id IS NULL
    ORDER BY mr.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching request pool:', err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, pool: results });
  });
});

// ====================================================
//  7️⃣ STATS & SUMMARIES
// ====================================================

// ✅ GET /mentor/stats
router.get('/stats', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;

  const menteesGuidedQuery = `
    SELECT COUNT(DISTINCT mentee_id) AS count
    FROM mentorship_requests
    WHERE mentor_id = ? AND status = 'accepted'
  `;

  const activeMentorshipsQuery = `
    SELECT COUNT(*) AS count
    FROM mentorship_requests
    WHERE mentor_id = ? AND status = 'accepted'
  `;

  const mentorshipHoursQuery = `
    SELECT IFNULL(SUM(TIMESTAMPDIFF(HOUR, created_at, NOW())), 0) AS total
    FROM mentorship_requests
    WHERE mentor_id = ? AND status = 'accepted'
  `;

  Promise.all([
    new Promise((resolve, reject) => {
      db.query(menteesGuidedQuery, [mentorId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].count);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(activeMentorshipsQuery, [mentorId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].count);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(mentorshipHoursQuery, [mentorId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].total);
      });
    })
  ])
  .then(([menteesGuided, activeMentorships, mentorshipHours]) => {
    res.json({
      success: true,
      menteesGuided,
      activeMentorships,
      mentorshipHours
    });
  })
  .catch(err => {
    console.error('❌ Error fetching stats:', err);
    res.status(500).json({ success: false });
  });
});

// ====================================================
//  8️⃣ MESSAGING
// ====================================================

// ✅ GET /mentor/request/:requestId/messages
router.get('/request/:requestId/messages', ensureMentor, (req, res) => {
  const { requestId } = req.params;

  const sql = `
    SELECT sender, message, created_at
    FROM mentorship_messages
    WHERE request_id = ?
    ORDER BY created_at ASC
  `;

  db.query(sql, [requestId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching messages:', err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, messages: results });
  });
});

// ✅ POST /mentor/request/:requestId/messages
router.post('/request/:requestId/messages', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;
  const { requestId } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message cannot be empty' });
  }

  const insertMessageSQL = `
    INSERT INTO mentorship_messages (request_id, sender, message)
    VALUES (?, 'mentor', ?)
  `;

  db.query(insertMessageSQL, [requestId, message], (err) => {
    if (err) {
      console.error('❌ Error saving message:', err);
      return res.status(500).json({ success: false });
    }

    const updateFeedbackSQL = `
      UPDATE mentorship_requests
      SET feedback = ?
      WHERE id = ? AND mentor_id = ?
    `;

    db.query(updateFeedbackSQL, [message, requestId, mentorId], (err2) => {
      if (err2) {
        console.error('❌ Error updating feedback:', err2);
        return res.status(500).json({ success: false });
      }

      res.json({ success: true, message: 'Message sent and feedback updated' });
    });
  });
});

// ====================================================
//  9️⃣ EXPORT ROUTER
// ====================================================
module.exports = router;
