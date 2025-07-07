const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport');

// ✅ Redirect based on role
function redirectByRole(req, res) {
  const user = req.user || req.session.user;

  if (req.session.collabRedirect) {
    const { projectId, userId, action } = req.session.collabRedirect;
    delete req.session.collabRedirect;
    return res.redirect(`/collaboration/response?projectId=${projectId}&userId=${userId}&action=${action}`);
  }

  let redirectUrl = '/dashboard';

  if (user.role === 'admin') {
    redirectUrl = '/admin';
  } else if (user.role === 'mentor') {
    redirectUrl = '/mentor';
  }

  res.redirect(redirectUrl);
}

// ✅ Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    failureMessage: true
  }),
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
  passport.authenticate('github', {
    failureRedirect: '/login',
    failureMessage: true
  }),
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
      return res.status(401).json({ success: false, message: info?.message || 'Login failed' });
    }

    req.login(user, (err) => {
      if (err) return next(err);

      console.log('[LOCAL LOGIN] req.login successful, setting session user');

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      if (req.headers.accept?.includes('application/json')) {
        let redirectUrl = '/dashboard';

        if (user.role === 'admin') {
          redirectUrl = '/admin';
        } else if (user.role === 'mentor') {
          redirectUrl = '/mentor';
        }

        return res.json({
          success: true,
          redirectUrl
        });
      }

      redirectByRole(req, res);
    });
  })(req, res, next);
});

// ✅ attach flash error to query string for redirects
router.use((req, res, next) => {
  if (req.session && req.session.messages && req.session.messages.length) {
    const msg = encodeURIComponent(req.session.messages.pop());
    return res.redirect(`/login?error=${msg}`);
  }
  next();
});

module.exports = router;
