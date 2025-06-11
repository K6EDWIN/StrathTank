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

// Local (email/password) login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info.message || 'Login failed' });
    }

    // Log the user in
    req.login(user, (err) => {
      if (err) return next(err);

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      res.json({ success: true, user: req.session.user });
    });
  })(req, res, next);
});