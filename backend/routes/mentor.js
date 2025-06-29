const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ensure user is mentor
function ensureMentor(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'mentor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
}

// ----------------------------------------
// GET /mentor/dashboard - Get mentor info & projects
// ----------------------------------------

router.get('/dashboard', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;

  // 1️⃣ Get the mentor profile
  const mentorQuery = `
    SELECT id, name, email, profile_image, bio 
    FROM Users 
    WHERE id = ?
  `;

  // 2️⃣ Get all approved projects
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

  // 3️⃣ Get assigned mentorship_requests where project is approved
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

  // Execute in series
  db.query(mentorQuery, [mentorId], (err, mentorResult) => {
    if (err) {
      console.error('❌ DB error (mentor):', err);
      return res.status(500).json({ success: false, message: 'DB error (mentor)' });
    }

    if (!mentorResult.length) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    const mentor = mentorResult[0];

    db.query(allProjectsQuery, (err, allProjects) => {
      if (err) {
        console.error('❌ DB error (all projects):', err);
        return res.status(500).json({ success: false, message: 'DB error (all projects)' });
      }

      db.query(assignedProjectsQuery, [mentorId], (err, assignedProjects) => {
        if (err) {
          console.error('❌ DB error (assigned projects):', err);
          return res.status(500).json({ success: false, message: 'DB error (assigned projects)' });
        }

        return res.json({
          success: true,
          mentor,
          allProjects,
          assignedProjects
        });
      });
    });
  });
});




// ----------------------------------------
// PUT /mentor/update-bio
// ----------------------------------------
router.put('/update-bio', ensureMentor, (req, res) => {
  const { bio } = req.body;
  const mentorId = req.session.user.id;

  db.query('UPDATE Users SET bio = ? WHERE id = ?', [bio, mentorId], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Bio update failed' });

    req.session.user.bio = bio;
    res.json({ success: true, message: 'Bio updated' });
  });
});

// ----------------------------------------
// GET /mentor/mentees - List mentees for mentor's projects
// ----------------------------------------
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
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, mentees: results });
  });
});

// ----------------------------------------
// GET /mentor/requests - Assigned mentorship requests
// ----------------------------------------
router.get('/requests', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;

  const sql = `
    SELECT mr.*, u.name AS mentee_name, p.title AS project_title
    FROM mentorship_request mr
    LEFT JOIN Users u ON mr.mentee_id = u.id
    LEFT JOIN Projects p ON mr.project_id = p.id
    WHERE mr.mentor_id = ?
    ORDER BY mr.created_at DESC
  `;

  db.query(sql, [mentorId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching requests:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, requests: results });
  });
});

// ----------------------------------------
// GET /mentor/request/:id - Single mentorship request
// ----------------------------------------
router.get('/request/:id', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;
  const requestId = req.params.id;

  const sql = `
    SELECT mr.*, u.name AS mentee_name, p.title AS project_title
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

// ----------------------------------------
// POST /mentor/respond - Accept or Reject a request
// ----------------------------------------
// ----------------------------------------
// POST /mentor/respond - Accept or Reject a request
// ----------------------------------------
router.post('/respond', ensureMentor, (req, res) => {
  const mentorId = req.session.user.id;
  const { requestId, action } = req.body;

  if (!['accepted', 'rejected'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  let sql;
  let params;

  if (action === 'accepted') {
    // This assigns the mentor to an unassigned request
    sql = `
      UPDATE mentorship_requests
      SET status = ?, mentor_id = ?
      WHERE id = ? AND (mentor_id IS NULL OR mentor_id = 0) AND status = 'pending'
    `;
    params = [action, mentorId, requestId];
  } else {
    // This rejects an already-assigned request (must belong to this mentor)
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
      return res.status(500).json({ success: false, message: 'Database error' });
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


// ----------------------------------------
// POST /mentor/feedback - Submit feedback
// ----------------------------------------
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

// ----------------------------------------
// GET /mentor/request-pool - View unassigned mentorship requests (pending)
// ----------------------------------------
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
    WHERE mr.status = 'pending' 
      AND mr.mentor_id IS NULL
    ORDER BY mr.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching request pool:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, pool: results });
  });
});

module.exports = router;
