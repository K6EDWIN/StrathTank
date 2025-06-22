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
// ----------------------------------------
// GitHub OAuth Routes
// ----------------------------------------

// Redirect user to GitHub for authentication
router.get('/github', (req, res, next) => {
  // Optional: Store redirect path in session
  if (req.query.redirect) {
    req.session.githubRedirect = req.query.redirect;
  }
  next();
}, passport.authenticate('github', { scope: ['user:email', 'repo'] }));

// GitHub callback after authentication
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // ✅ Store GitHub access token in session
    if (req.user.githubAccessToken) {
      req.session.githubAccessToken = req.user.githubAccessToken;
    }

    // ✅ Store user data in session
    req.session.user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };

    req.session._isNewUser = req.user._isNewUser;

    // ✅ Redirect to dashboard or to original page if provided
    const redirectUrl = req.session.githubRedirect
      || (req.user._isNewUser ? '/signup?showRoleModal=true' : '/dashboard');

    delete req.session.githubRedirect;

    res.redirect(redirectUrl);
  }
);

module.exports = router;


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