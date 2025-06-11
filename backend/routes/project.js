const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/projects
router.get('/projects', (req, res) => {
  const sql = `
    SELECT p.id, p.title, p.description, p.category, p.created_at, 
           COALESCE(l.like_count, 0) AS likes,
           COALESCE(c.comment_count, 0) AS comments,
           p.file_path AS image
    FROM projects p
    LEFT JOIN (SELECT project_id, COUNT(*) AS like_count FROM likes GROUP BY project_id) l ON p.id = l.project_id
    LEFT JOIN (SELECT project_id, COUNT(*) AS comment_count FROM comments GROUP BY project_id) c ON p.id = c.project_id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// GET /api/homepageprojects
router.get('/homepageprojects', (req, res) => {
  const limit = parseInt(req.query.limit) || 3;
  const offset = parseInt(req.query.offset) || 0;

  const sql = `
    SELECT 
      p.id, 
      p.title, 
      p.description, 
      p.category, 
      p.created_at, 
      u.name AS author,
      COALESCE(l.like_count, 0) AS likes,
      COALESCE(c.comment_count, 0) AS comments,
      p.file_path AS image
    FROM projects p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN (
      SELECT project_id, COUNT(*) AS like_count 
      FROM likes 
      GROUP BY project_id
    ) l ON p.id = l.project_id
    LEFT JOIN (
      SELECT project_id, COUNT(*) AS comment_count 
      FROM comments 
      GROUP BY project_id
    ) c ON p.id = c.project_id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// GET /api/user
router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }

  const showRoleModal = req.session._isNewUser;
  delete req.session._isNewUser;

  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    },
    showRoleModal
  });
});

module.exports = router;
