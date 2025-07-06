const express = require('express');
const path = require('path');
const router = express.Router();

// Middleware for auth check
const ensureAuth = (req, res, next) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  next();
};

const ensureRole = role => (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== role) return res.redirect('/login');
  next();
};

// ---------- PUBLIC ROUTES ----------
router.get('/', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Homepage.html')));
router.get('/signup', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Registration.html')));
router.get('/login', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Login.html')));
router.get('/forgot-password', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Forgot Password.html')));
router.get('/reset-password', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Reset Password.html')));
router.get('/verify-email', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Verify Account.html')));

// ---------- STUDENT ROUTES ----------
router.get('/dashboard', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Student Dashboard.html'))
);
router.get('/explore-projects', (_, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Student Explore.html'))
);
router.get('/project-view', (_, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Student IT Project view.html'))
);
router.get('/individualProjectsViewnonIT', (_, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Student other Project view.html'))
);
router.get('/upload-project', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Student Project Upload.html'))
);
router.get('/profile', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Student My Profile.html'))
);
router.get('/otherProfile', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Student profile view.html'))
);
router.get('/profile/:userId', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Student profile view.html'))
);
router.get('/mentorship-request', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Student Request Mentorship.html'))
);
router.get('/hub', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Student mentorship Hub.html'))
);

// ---------- MENTOR ROUTES ----------
router.get('/mentor', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Mentor dashboard.html'))
);
router.get('/mentorprofile', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Mentor Profile.html'))
);
router.get('/mentorshipHub', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Mentorship hub.html'))
);
router.get('/explorementors', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Mentors Explore.html'))
);
router.get('/mentornonit', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Mentor other Project view.html'))
);
router.get('/mentorviewit', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Mentor IT Project view.html'))
);

// ---------- ADMIN ROUTES ----------
router.get('/admin', ensureRole('admin'), (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Admin Dashboard.html'))
);
router.get('/adminExplore', ensureRole('admin'), (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Admin Explore.html'))
);
router.get('/AllUsers', ensureRole('admin'), (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Admin All Users.html'))
);
router.get('/collaborations', ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Admin collaborations.html'))
);
router.get('/adminMentorships', ensureRole('admin'), (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Admin Mentorships.html'))
);
router.get('/admin/profile', ensureRole('admin'), (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/Admin Profile.html'))
);
router.get('/adminitview', ensureRole('admin'), (req, res) => {
  const { projectId } = req.params;
  res.sendFile(path.join(__dirname, '../frontend/Admin IT Project view.html'));
});
router.get('/adminnonitview', ensureRole('admin'), (req, res) => {
  const { projectId } = req.params;
  res.sendFile(path.join(__dirname, '../frontend/Admin other Project view.html'));  
});

module.exports = router;
