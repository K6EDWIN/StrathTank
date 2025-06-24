const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ Get all projects where user is owner or collaborator
router.get('/projects/for-mentorship/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT 
      p.id, p.title, p.description, p.project_profile_picture AS image,
      p.created_at,
      CASE 
        WHEN p.user_id = ? THEN 'owned'
        ELSE 'collaborated'
      END AS relationship
    FROM projects p
    LEFT JOIN project_team_members ptm ON p.id = ptm.project_id
    WHERE p.user_id = ? OR ptm.user_id = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, [userId, userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// ✅ Submit mentorship request
router.post('/mentorship-request', (req, res) => {
  const menteeId = req.session?.user?.id || req.user?.id;
  if (!menteeId) return res.status(401).json({ error: 'User not authenticated' });

  const {
    subject,
    challenge,
    primary_area,
    preferred_skills,
    availability,
    project_id
  } = req.body;

  if (!subject || !challenge || !primary_area || !project_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO mentorship_requests (
      project_id, mentee_id, subject, challenge,
      primary_area, preferred_skills, availability, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
  `;

  const values = [
    project_id,
    menteeId,
    subject,
    challenge,
    primary_area,
    preferred_skills || null,
    availability || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ error: 'Failed to submit mentorship request' });
    }

    res.status(201).json({ success: true, message: 'Mentorship request submitted successfully' });
  });
});

module.exports = router;
