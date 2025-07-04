const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

// ✅ Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// ✅ Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const query = 'SELECT * FROM Users WHERE email = ?';
      db.query(query, [email], async (err, results) => {
        if (err) return done(err);

        if (!results.length) {
          return done(null, false, { message: 'User not found' });
        }

        const user = results[0];

        if (user.suspended) {
          return done(null, false, { message: 'Your account is suspended. Contact strathtank@gmail.com for assistance.' });
        }

        if (!user.verified) {
          return done(null, false, { message: 'Please verify your email first.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        user._isNewUser = false;
        return done(null, user);
      });
    } catch (err) {
      return done(err);
    }
  }
));

// ✅ Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value;
  const name = profile.displayName || 'Google User';
  const image = profile.photos?.[0]?.value || null;

  if (!email) {
    return done(null, false, { message: 'No email provided by Google.' });
  }

  const query = 'SELECT * FROM Users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return done(err);

    if (results.length > 0) {
      const user = results[0];

      if (user.suspended) {
        return done(null, false, { message: 'Your account is suspended. Contact strathtank@gmail.com for assistance.' });
      }

      user._isNewUser = false;
      return done(null, user);
    }

    const insertQuery = 'INSERT INTO Users (name, email, profile_image, verified) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [name, email, image, true], (insertErr, insertResult) => {
      if (insertErr) return done(insertErr);

      db.query('SELECT * FROM Users WHERE id = ?', [insertResult.insertId], (fetchErr, newUser) => {
        if (fetchErr) return done(fetchErr);
        newUser[0]._isNewUser = true;
        return done(null, newUser[0]);
      });
    });
  });
}));

// ✅ GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/github/callback',
  scope: ['user:email', 'repo']
}, (accessToken, refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value;
  const name = profile.displayName || profile.username || 'GitHub User';
  const image = profile.photos?.[0]?.value || null;

  if (!email) {
    return done(null, false, { message: 'Email is required from GitHub. Please make your email public or use another method.' });
  }

  const query = 'SELECT * FROM Users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return done(err);

    const user = results.length > 0 ? results[0] : null;

    const proceed = (finalUser) => {
      finalUser._isNewUser = !user;
      finalUser.githubAccessToken = accessToken;
      return done(null, finalUser);
    };

    if (user) {
      if (user.suspended) {
        return done(null, false, { message: 'Your account is suspended. Contact strathtank@gmail.com for assistance.' });
      }

      proceed(user);
    } else {
      const insertQuery = 'INSERT INTO Users (name, email, profile_image, verified) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [name, email, image, true], (insertErr, insertResult) => {
        if (insertErr) return done(insertErr);

        db.query('SELECT * FROM Users WHERE id = ?', [insertResult.insertId], (fetchErr, newUser) => {
          if (fetchErr) return done(fetchErr);
          proceed(newUser[0]);
        });
      });
    }
  });
}));

// ✅ Session Management
passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    githubAccessToken: user.githubAccessToken || null
  });
});

passport.deserializeUser((sessionUser, done) => {
  db.query('SELECT * FROM Users WHERE id = ?', [sessionUser.id], (err, results) => {
    if (err) return done(err);
    if (!results.length) return done(null, false);

    const user = results[0];
    user.githubAccessToken = sessionUser.githubAccessToken || null;
    return done(null, user);
  });
});

module.exports = passport;
