const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport');

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

    if (req.session.collabRedirect) {
      const { projectId, userId, action } = req.session.collabRedirect;
      delete req.session.collabRedirect;
      return res.redirect(`/collaboration/response?projectId=${projectId}&userId=${userId}&action=${action}`);
    }

    const redirectUrl = req.user._isNewUser ? '/signup?showRoleModal=true' : '/dashboard';
    res.redirect(redirectUrl);
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

    if (req.session.collabRedirect) {
      const { projectId, userId, action } = req.session.collabRedirect;
      delete req.session.collabRedirect;
      return res.redirect(`/collaboration/response?projectId=${projectId}&userId=${userId}&action=${action}`);
    }

    const redirectUrl = req.session.githubRedirect
      || (req.user._isNewUser ? '/signup?showRoleModal=true' : '/dashboard');

    delete req.session.githubRedirect;
    res.redirect(redirectUrl);
  }
);

// ✅ Local (email/password) login
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

      if (req.session.collabRedirect) {
        const { projectId, userId, action } = req.session.collabRedirect;
        delete req.session.collabRedirect;
        return res.redirect(`/collaboration/response?projectId=${projectId}&userId=${userId}&action=${action}`);
      }

      res.redirect('/dashboard');
    });
  })(req, res, next);
});

module.exports = router;
