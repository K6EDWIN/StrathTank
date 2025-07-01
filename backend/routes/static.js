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
router.get('/explore-projects', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Student Explore.html')));



router.get('/project-view', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Student IT Project view.html')));



router.get('/individualProjectsViewnonIT', (_, res) => res.sendFile(path.join(__dirname, '../frontend/Student other Project view.html')));

router.get('/upload-project', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Student Project Upload.html')); });

  router.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Student My Profile.html'));
  
});
router.get('/otherProfile', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Student profile view.html'));
});
router.get('/profile/:userId', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Student profile view.html'));

});
router.get('/mentorship-request', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Student Request Mentorship.html'));

});



router.get('/admin', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Admin Dashboard.html'));
});

router.get('/adminExplore', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Admin Explore.html'));

});
  router.get('/AllUsers', (req, res) => {  if (!req.isAuthenticated() || req.user.role !== 'admin') return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Admin All Users.html'));

});
router.get('/collaborations', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Admin collaborations.html'));
});
router.get('/admin/profile', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Admin Profile.html'));

});
router.get('/mentor', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Mentor dashboard.html'));
});
router.get('/mentorprofile', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Mentor Profile.html'));  
});
router.get('/mentorshipHub',(req,res)=> {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Mentorship hub.html'));  
});
router.get('/explorementors', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Mentors Explore.html'));   
});
router.get('/mentornonit', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Mentor IT Project view.html'));
});
router.get('/mentorviewit', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Mentor other Project view.html'));
});
router.get('/hub', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../frontend/Student mentorship Hub.html'));
});
module.exports = router;
