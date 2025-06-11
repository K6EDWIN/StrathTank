const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport');

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    req.session.user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };
    req.session._isNewUser = req.user._isNewUser;
    const redirectUrl = req.user._isNewUser ? '/signup?showRoleModal=true' : '/dashboard';
    res.redirect(redirectUrl);
  }
);

// GitHub OAuth
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    req.session.user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };
    req.session._isNewUser = req.user._isNewUser;
    const redirectUrl = req.user._isNewUser ? '/signup?showRoleModal=true' : '/dashboard';
    res.redirect(redirectUrl);
  }
);

module.exports = router;
