const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Homepage.html')));
router.get('/signup', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Registration.html')));
router.get('/login', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Login.html')));
router.get('/forgot-password', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Forgot Password.html')));
router.get('/reset-password', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Reset Password.html')));
router.get('/verify-email', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Verify Account.html')));
router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Student Dashboard.html'));
});
router.get('/explore-projects', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Explore.html')));
router.get('/project-view', (_, res) => res.sendFile(path.join(__dirname, '../frontend/IT Projects.html')));
router.get('/individualProjectsViewnonIT', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Other Projects.html')));
router.get('/upload-project', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Upload.html')); });
  router.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Student My Profile.html'));
});
router.get('/otherProfile', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Profile view.html'));
});
router.get('/profile/:userId', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Profile view.html'));

});
router.get('/mentorship-request', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Request Mentorship.html'));
});

module.exports = router;
