const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');


// Middleware to check if user is admin
function isAdmin(req, res, next) {
  const user = req.session.user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
}

// ----------------------------------------
//GET /admin/stats - Dashboard Summary
// ----------------------------------------
router.get('/stats', isAdmin, (req, res) => {
  const stats = {
    totalUsers: 0,
    totalProjects: 0,
    totalCollaborations: 0
  };

  const userQuery = 'SELECT COUNT(*) AS total FROM Users';
  const projectQuery = 'SELECT COUNT(*) AS total FROM Projects';
  const collabQuery = 'SELECT COUNT(*) AS total FROM Collaborations'; 

  db.query(userQuery, (err, userResult) => {
    if (err) return res.status(500).json({ success: false });

    stats.totalUsers = userResult[0].total;

    db.query(projectQuery, (err, projectResult) => {
      if (err) return res.status(500).json({ success: false });

      stats.totalProjects = projectResult[0].total;

      db.query(collabQuery, (err, collabResult) => {
        if (err) return res.status(500).json({ success: false });

        stats.totalCollaborations = collabResult[0].total;
        res.json({ success: true, stats });
      });
    });
  });
});

// ----------------------------------------
// GET /admin/users - Recent Users
// ----------------------------------------
router.get('/users', isAdmin, (req, res) => {
  const sql = `SELECT id, name, email, role,suspended FROM Users ORDER BY id DESC LIMIT 10`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, users: results });
  });
});
// ----------------------------------------
// GET /admin/users - all Users
// ----------------------------------------
router.get('/allusers', isAdmin, (req, res) => {
  const sql = `SELECT id, name, email, role,suspended FROM Users ORDER BY name ASC `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, users: results });
  });
});


// ----------------------------------------
// GET /admin/pending-projects - Pending Approvals
// ----------------------------------------
router.get('/pending-projects', isAdmin, (req, res) => {
  const sql = `SELECT id, title, user_id, description FROM Projects WHERE status = 'pending' ORDER BY created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false });

    // Fetch user emails for each
    const promises = results.map(project => {
      return new Promise((resolve) => {
        db.query(`SELECT email FROM Users WHERE id = ?`, [project.user_id], (err, userRes) => {
          project.submittedBy = userRes?.[0]?.email || 'Unknown';
          resolve(project);
        });
      });
    });

    Promise.all(promises).then(data => {
      res.json({ success: true, projects: data });
    });
  });
});

// ----------------------------------------
// GET /admin/flagged-projects - Flagged for Review
// ----------------------------------------

router.get('/flagged-projects', isAdmin, (req, res) => {
  const sql = `
    SELECT 
      fp.id AS flag_id,
      fp.project_id,
      p.title AS name,
      p.project_type,
      fp.flagged_by,
      fp.flag_reason
    FROM FlaggedProjects fp
    JOIN Projects p ON fp.project_id = p.id
    ORDER BY fp.flagged_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false });

    const promises = results.map(proj => {
      return new Promise((resolve) => {
        db.query(`SELECT email FROM Users WHERE id = ?`, [proj.flagged_by], (err, userRes) => {
          proj.flaggedBy = userRes?.[0]?.email || 'Unknown';
          resolve(proj);
        });
      });
    });

    Promise.all(promises).then(data => {
      res.json({ success: true, flagged: data });
    });
  });
});


// ----------------------------------------
// POST /admin/approve/:projectId
// ----------------------------------------
router.post('/approve/:projectId', isAdmin, (req, res) => {
  const { projectId } = req.params;
  db.query(`UPDATE Projects SET status = 'approved' WHERE id = ?`, [projectId], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// ----------------------------------------
// POST /admin/reject/:projectId
// ----------------------------------------
router.post('/reject/:projectId', isAdmin, (req, res) => {
  const { projectId } = req.params;
  db.query(`UPDATE Projects SET status = 'rejected' WHERE id = ?`, [projectId], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// ----------------------------------------
// POST /admin/reject/:projectId
// ----------------------------------------
router.post('/reject/:projectId', isAdmin, (req, res) => {
  const { projectId } = req.params;
  db.query(`UPDATE Projects SET status = 'rejected' WHERE id = ?`, [projectId], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});


// ----------------------------------------
// POST /admin/suspend/:userId
// ----------------------------------------
router.post('/suspend/:userId', isAdmin, (req, res) => {
  const { userId } = req.params;
  const suspend = req.body.suspend === true || req.body.suspend === 'true';

  db.query(`UPDATE Users SET suspended = ? WHERE id = ?`, [suspend, userId], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, message: suspend ? 'User suspended' : 'User unsuspended' });
  });
});

// ----------------------------------------
// DELETE /admin/users/:id - Delete User and Related Data + Sessions
// ----------------------------------------
router.delete('/users/:id', isAdmin, (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  // Step 1: Delete likes
  db.query('DELETE FROM likes WHERE user_id = ?', [userId], (err) => {
    if (err) {
      console.error('❌ Failed to delete likes:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete user likes' });
    }

    // Step 2: Delete comments
    db.query('DELETE FROM comments WHERE user_id = ?', [userId], (err) => {
      if (err) {
        console.error('❌ Failed to delete comments:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete user comments' });
      }

      // Step 3: Remove user from project_team_members
      db.query('DELETE FROM project_team_members WHERE user_id = ?', [userId], (err) => {
        if (err) {
          console.error('❌ Failed to remove user from team_members:', err);
          return res.status(500).json({ success: false, message: 'Team member deletion failed' });
        }

        // Step 4: Delete projects owned by user (first their team members)
        db.query('SELECT id FROM projects WHERE user_id = ?', [userId], (err, projectRows) => {
          if (err) {
            console.error('❌ Failed to fetch user projects:', err);
            return res.status(500).json({ success: false, message: 'Error fetching projects' });
          }

          const projectIds = projectRows.map(p => p.id);
          if (projectIds.length === 0) {
            // No owned projects — skip to collaborations
            return deleteCollaborations();
          }

          // 4a: Delete team members of those projects
          db.query('DELETE FROM project_team_members WHERE project_id IN (?)', [projectIds], (err) => {
            if (err) {
              console.error('❌ Failed to delete project team members:', err);
              return res.status(500).json({ success: false, message: 'Team member cleanup failed' });
            }

            // 4b: Delete the projects themselves
            db.query('DELETE FROM projects WHERE id IN (?)', [projectIds], (err) => {
              if (err) {
                console.error('❌ Failed to delete projects:', err);
                return res.status(500).json({ success: false, message: 'Project deletion failed' });
              }

              // Continue to collaborations
              deleteCollaborations();
            });
          });
        });

        // Helper to remove from collaborations and finally delete the user
        function deleteCollaborations() {
          // Step 5: Remove from collaborations
          db.query('DELETE FROM collaborations WHERE collaborator_id = ?', [userId], (err) => {
            if (err) {
              console.error('❌ Failed to remove user from collaborations:', err);
              return res.status(500).json({ success: false, message: 'Collaboration deletion failed' });
            }

            // Step 6: Delete user record
            db.query('DELETE FROM Users WHERE id = ?', [userId], (err, result) => {
              if (err) {
                console.error('❌ Error deleting user:', err);
                return res.status(500).json({ success: false, message: 'User deletion failed' });
              }

              if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
              }

              // ✅ Step 7: Clean up sessions belonging to this user
              db.query(
                `DELETE FROM sessions WHERE JSON_EXTRACT(data, '$.user.id') = ?`,
                [userId],
                (err) => {
                  if (err) {
                    console.error('⚠️ Failed to clean up sessions:', err);
                    // Don't hard-fail, just log
                  }

                  res.json({ success: true, message: 'User and related data deleted successfully' });
                }
              );
            });
          });
        }
      });
    });
  });
});




// ----------------------------------------
// GET /admin/collaborations - All collaboration requests
// ----------------------------------------
router.get('/collaborations', isAdmin, (req, res) => {
  const sql = `
    SELECT 
      c.id AS collaboration_id,
      c.status,
      c.requested_at,
      
      p.id AS project_id,
      p.title AS project_title,
      p.description AS project_description,

      owner.name AS owner_name,
      owner.email AS owner_email,

      collaborator.name AS collaborator_name,
      collaborator.email AS collaborator_email

    FROM collaborations c
    JOIN projects p ON c.project_id = p.id
    JOIN users owner ON p.user_id = owner.id
    JOIN users collaborator ON c.collaborator_id = collaborator.id
    ORDER BY c.requested_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching collaborations:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: true, collaborations: results });
  });
});
const bcrypt = require('bcrypt'); // If not already included

// ✅ Change Admin Password
router.post('/change-password', isAdmin, async (req, res) => {
  const userId = req.session?.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  db.query('SELECT password FROM users WHERE id = ?', [userId], async (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ success: false, message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, results[0].password);
    if (!match) return res.status(400).json({ success: false, message: 'Incorrect current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Update failed' });
      res.json({ success: true });
    });
  });
});

// ✅ Get Admin Profile Info
router.get('/profile/info', isAdmin, (req, res) => {
  const userId = req.session?.user?.id;

  db.query('SELECT id, name, email, profile_image FROM Users WHERE id = ?', [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to fetch admin data' });
    }

    res.json({ success: true, user: results[0] });
  });
});

// ✅ Delete Admin's Own Account
router.delete('/delete-account', isAdmin, (req, res) => {
  const userId = req.session?.user?.id;

  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  // Optionally: prevent deleting superadmin
  // if (req.session.user.email === 'superadmin@email.com') return res.status(403).json({ success: false, message: 'Superadmin cannot delete self' });

  db.query('DELETE FROM Users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      console.error('❌ Error deleting admin account:', err);
      return res.status(500).json({ success: false, message: 'Deletion failed' });
    }

    // Destroy session after deletion
    req.session.destroy((err) => {
      if (err) console.error('⚠️ Session destroy error:', err);
      res.json({ success: true, message: 'Account deleted successfully' });
    });
  });
});

// ✅ Configure Multer Storage for Admin Profile Pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `admin-${req.session.user.id}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// ✅ POST /admin/profile-picture - Upload Admin Profile Image
router.post('/profile-picture', isAdmin, upload.single('profile_picture'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const imagePath = path.join('uploads', req.file.filename);

  db.query('UPDATE Users SET profile_image = ? WHERE id = ?', [imagePath, req.session.user.id], (err) => {
    if (err) {
      console.error('❌ Failed to update profile image:', err);
      return res.status(500).json({ success: false, message: 'Database update failed' });
    }

    res.json({ success: true, imagePath });
  });
});



// ----------------------------------------
// GET /admin/mentorships - All mentorship requests
// ----------------------------------------
router.get('/mentorships', isAdmin, (req, res) => {
  res.set('Cache-Control', 'no-store');

  const sql = `
    SELECT 
      mr.id,
      mr.mentee_id,
      mr.project_id,
      p.title AS project_name,
      mentee.name AS mentee_name,
      mentee.email AS mentee_email,
      mr.subject,
      mr.challenge,
      mr.primary_area,
      mr.preferred_skills,
      mr.availability,
      mr.status,
      mr.mentor_id,
      mentor.name AS mentor_name,
      mentor.email AS mentor_email,
      mr.created_at
    FROM mentorship_requests mr
    LEFT JOIN users mentee ON mr.mentee_id = mentee.id
    LEFT JOIN users mentor ON mr.mentor_id = mentor.id
    LEFT JOIN projects p ON mr.project_id = p.id
    ORDER BY mr.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching mentorship requests:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: true, mentorships: results });
  });
});


// ----------------------------------------
// GET /admin/mentorships/:requestId/messages - Chat messages for a mentorship request
// ----------------------------------------
router.get('/mentorships/:requestId/messages', isAdmin, (req, res) => {
  const { requestId } = req.params;

  const sql = `
    SELECT 
      id,
      sender,
      message,
      created_at
    FROM mentorship_messages
    WHERE request_id = ?
    ORDER BY created_at ASC
  `;

  db.query(sql, [requestId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching mentorship messages:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, messages: results });
  });
});



// ----------------------------------------
// suspend or unsuspend a project
// ----------------------------------------

router.post('/suspend-project/:projectId', isAdmin, (req, res) => {
  const { projectId } = req.params;
  const { action } = req.body;

  if (!['suspend', 'unsuspend'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action. Use "suspend" or "unsuspend".' });
  }

  const newStatus = action === 'suspend' ? 'suspended' : 'approved';

  db.query(`UPDATE Projects SET status = ? WHERE id = ?`, [newStatus, projectId], (err) => {
    if (err) {
      console.error('❌ Error updating project status:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: `Project ${action}ed successfully.` });
  });
});

// ✅ Get all projects
router.get('/projects', (req, res) => {
  const sort = req.query.sort || 'newest';

  let orderClause = 'p.created_at DESC';
  let whereClause = 'p.status = "approved"'; // Default

  if (sort === 'most-liked') orderClause = 'likes DESC';
  else if (sort === 'most-commented') orderClause = 'comments DESC';
  else if (sort === 'approved') whereClause = 'p.status= "approved"';
  else if (sort === 'suspended') whereClause = 'p.status = "suspended"';
  else if (sort === 'pending') whereClause = 'p.status = "pending"';

  const sql = `
    SELECT 
      p.id, p.title, p.description, p.category, p.created_at, p.status,p.project_type,
      u.name AS author,
      COALESCE(l.like_count, 0) AS likes,
      COALESCE(c.comment_count, 0) AS comments,
      p.project_profile_picture AS image
    FROM projects p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN (SELECT project_id, COUNT(*) AS like_count FROM likes GROUP BY project_id) l ON p.id = l.project_id
    LEFT JOIN (SELECT project_id, COUNT(*) AS comment_count FROM comments GROUP BY project_id) c ON p.id = c.project_id
    WHERE ${whereClause}
    ORDER BY ${orderClause}
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// ✅ Search projects
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
      p.project_profile_picture AS image
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

// ✅ Get all project categories
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

// ✅ Get projects by category
router.get('/projects/by-category', (req, res) => {
  const { category, sort } = req.query;

  if (!category) return res.status(400).json({ error: 'Category is required' });

  let orderClause = 'p.created_at DESC';
  if (sort === 'most-liked') orderClause = 'likes DESC';
  else if (sort === 'most-commented') orderClause = 'comments DESC';

  const sql = `
    SELECT 
      p.id, p.title, p.description, p.category, p.created_at,p.project_type,
      COALESCE(l.like_count, 0) AS likes,
      COALESCE(c.comment_count, 0) AS comments,
      p.project_profile_picture AS image
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

// ✅ Get project details
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

module.exports = router;
