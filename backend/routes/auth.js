const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport');

// ✅ Helper: Redirect based on role
function redirectByRole(req, res) {
  const user = req.user || req.session.user;

  if (req.session.collabRedirect) {
    const { projectId, userId, action } = req.session.collabRedirect;
    delete req.session.collabRedirect;
    return res.redirect(`/collaboration/response?projectId=${projectId}&userId=${userId}&action=${action}`);
  }

  const redirectUrl = user.role === 'admin' ? '/admin' : '/dashboard';
  res.redirect(redirectUrl);
}

// ✅ Google OAuth
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

    redirectByRole(req, res);
  }
);

// ✅ GitHub OAuth
router.get('/github', (req, res, next) => {
  if (req.query.redirect) {
    req.session.githubRedirect = req.query.redirect;
  }
  next();
}, passport.authenticate('github', { scope: ['user:email', 'repo'] }));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    if (req.user.githubAccessToken) {
      req.session.githubAccessToken = req.user.githubAccessToken;
    }

    req.session.user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };
    req.session._isNewUser = req.user._isNewUser;

    redirectByRole(req, res);
  }
);

// ✅ Local login (email/password)
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info.message || 'Login failed' });
    }

    req.login(user, (err) => {
      if (err) return next(err);

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      // If using fetch, return JSON:
      if (req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          redirectUrl: user.role === 'admin' ? '/admin' : '/dashboard'
        });
      }

      // Otherwise standard redirect
      redirectByRole(req, res);
    });
  })(req, res, next);
});

module.exports = router;
