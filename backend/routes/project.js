const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ GET /api/projects
router.get('/projects', (req, res) => {
  const sort = req.query.sort || 'newest';
  const currentUserId = req.user?.id || null;

  let orderBy = 'p.created_at DESC';
  if (sort === 'most-liked') orderBy = 'likes DESC';
  else if (sort === 'most-commented') orderBy = 'comments DESC';

  const sql = `
    SELECT 
      p.id, p.title, p.description, p.category, p.created_at, p.project_type,
      COALESCE(l.like_count, 0) AS likes,
      COALESCE(c.comment_count, 0) AS comments,
      p.file_path AS image,
      p.user_id
    FROM projects p
    LEFT JOIN (SELECT project_id, COUNT(*) AS like_count FROM likes GROUP BY project_id) l ON p.id = l.project_id
    LEFT JOIN (SELECT project_id, COUNT(*) AS comment_count FROM comments GROUP BY project_id) c ON p.id = c.project_id
    ORDER BY ${orderBy}
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    const projects = results.map(project => ({
      ...project,
      is_owner: currentUserId !== null && project.user_id === currentUserId
    }));

    res.json(projects);
  });
});

// ✅ GET /api/homepageprojects
router.get('/homepageprojects', (req, res) => {
  const limit = parseInt(req.query.limit) || 3;
  const offset = parseInt(req.query.offset) || 0;

  const sql = `
    SELECT 
      p.id, p.title, p.description, p.category, p.created_at,
      u.name AS author,
      COALESCE(l.like_count, 0) AS likes,
      COALESCE(c.comment_count, 0) AS comments,
      p.file_path AS image
    FROM projects p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN (SELECT project_id, COUNT(*) AS like_count FROM likes GROUP BY project_id) l ON p.id = l.project_id
    LEFT JOIN (SELECT project_id, COUNT(*) AS comment_count FROM comments GROUP BY project_id) c ON p.id = c.project_id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// ✅ GET /api/user
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

// ✅ GET /api/searchprojects?q=term
router.get('/searchprojects', (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm || searchTerm.trim() === '') {
    return res.status(400).json({ error: 'Missing search term' });
  }

  const likeQuery = `%${searchTerm}%`;

  const sql = `
    SELECT 
      p.id, p.title, p.description, p.category, p.created_at,
      u.name AS author,
      COALESCE(l.like_count, 0) AS likes,
      COALESCE(c.comment_count, 0) AS comments,
      p.file_path AS image
    FROM projects p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN (SELECT project_id, COUNT(*) AS like_count FROM likes GROUP BY project_id) l ON p.id = l.project_id
    LEFT JOIN (SELECT project_id, COUNT(*) AS comment_count FROM comments GROUP BY project_id) c ON p.id = c.project_id
    WHERE p.title LIKE ? OR u.name LIKE ?
    ORDER BY p.created_at DESC
  `;

  db.query(sql, [likeQuery, likeQuery], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// ✅ GET /api/categories
router.get('/categories', (req, res) => {
  const sql = `
    SELECT DISTINCT category 
    FROM projects 
    WHERE category IS NOT NULL AND category != ''
    ORDER BY category
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// ✅ GET /api/projects/by-category
router.get('/projects/by-category', (req, res) => {
  const { category, sort } = req.query;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  let orderClause = 'p.created_at DESC';
  if (sort === 'most-liked') orderClause = 'likes DESC';
  else if (sort === 'most-commented') orderClause = 'comments DESC';

  const sql = `
    SELECT 
      p.id, p.title, p.description, p.category, p.created_at,
      COALESCE(l.like_count, 0) AS likes,
      COALESCE(c.comment_count, 0) AS comments,
      p.file_path AS image
    FROM projects p
    LEFT JOIN (SELECT project_id, COUNT(*) AS like_count FROM likes GROUP BY project_id) l ON p.id = l.project_id
    LEFT JOIN (SELECT project_id, COUNT(*) AS comment_count FROM comments GROUP BY project_id) c ON p.id = c.project_id
    WHERE p.category = ?
    ORDER BY ${orderClause}
  `;

  db.query(sql, [category], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// ✅ GET /api/projects/:id/details
router.get('/projects/:id/details', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      p.id, p.title, p.Short_description AS short_description,
      p.description AS overview, p.tags, p.technical_details,
      p.status, p.launch_date, p.project_lead, p.team_size,
      p.Project_profile_picture AS profile_picture,
      p.screenshots, p.documents, p.version, p.project_type, p.category,
      COALESCE(l.like_count, 0) AS likes
    FROM projects p
    LEFT JOIN (SELECT project_id, COUNT(*) AS like_count FROM likes GROUP BY project_id) l ON p.id = l.project_id
    WHERE p.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Project not found' });

    const project = results[0];
    project.tags = project.tags ? project.tags.split(',').map(tag => tag.trim()) : [];
    project.screenshots = project.screenshots ? project.screenshots.split(',') : [];
    project.documents = project.documents ? project.documents.split(',') : [];

    res.json(project);
  });
});

// ✅ GET /api/projects/:projectId/team
router.get('/projects/:projectId/team', (req, res) => {
  const projectId = parseInt(req.params.projectId);

  if (isNaN(projectId)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const sql = `
    SELECT 
      u.id AS user_id,
      u.name,
      u.profile_image AS profile_photo,
      ptm.role
    FROM project_team_members ptm
    JOIN users u ON ptm.user_id = u.id
    WHERE ptm.project_id = ?
  `;

  db.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error('🔥 SQL Error:', err); // Log full error
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.json(results);
  });
});

// ✅ GET /api/projects/:id/comments
router.get('/projects/:id/comments', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT c.id, c.comment AS content, c.created_at, u.name AS user_name
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.project_id = ?
    ORDER BY c.created_at DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Comments route error:", err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.json(results);
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
// ✅ Toggle like / unlike
router.post('/projects/:id/like', (req, res) => {
  const { id: project_id } = req.params;
  const user_id = req.session?.user?.id;

  if (!user_id) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  const checkSql = `SELECT id FROM likes WHERE project_id = ? AND user_id = ?`;
  db.query(checkSql, [project_id, user_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error (check)' });

    if (results.length > 0) {
      // ✅ Unlike
      const deleteSql = `DELETE FROM likes WHERE project_id = ? AND user_id = ?`;
      db.query(deleteSql, [project_id, user_id], (err2) => {
        if (err2) return res.status(500).json({ error: 'Database error (delete)' });

        // ✅ Get new like count
        db.query(`SELECT COUNT(*) AS like_count FROM likes WHERE project_id = ?`, [project_id], (err3, countRes) => {
          if (err3) return res.status(500).json({ error: 'Count error after unlike' });
          res.json({ status: "unliked", newLikeCount: countRes[0].like_count });
        });
      });
    } else {
      // ✅ Like
      const insertSql = `INSERT INTO likes (project_id, user_id, created_at) VALUES (?, ?, NOW())`;
      db.query(insertSql, [project_id, user_id], (err2) => {
        if (err2) return res.status(500).json({ error: 'Database error (insert)' });

        db.query(`SELECT COUNT(*) AS like_count FROM likes WHERE project_id = ?`, [project_id], (err3, countRes) => {
          if (err3) return res.status(500).json({ error: 'Count error after like' });
          res.json({ status: "liked", newLikeCount: countRes[0].like_count });
        });
      });
    }
  });
});


module.exports = router;
