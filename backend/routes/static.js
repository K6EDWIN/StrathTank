const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Homepage.html')));
router.get('/signup', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Registration.html')));
router.get('/login', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Login.html')));
router.get('/forgot-password', (_, res) => res.sendFile(path.join(__dirname, '../frontend/forgotpassword.html')));
router.get('/reset-password', (_, res) => res.sendFile(path.join(__dirname, '../frontend/resetpassword.html')));
router.get('/verify-email', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Verify.html')));
router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/userDashboard.html'));
});
router.get('/explore-projects', (_, res) => res.sendFile(path.join(__dirname, '../frontend/exploreProjects.html')));
module.exports = router;
