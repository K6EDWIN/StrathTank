
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

// Setup DB connection 
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Local Strategy (email/password)
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    const query = 'SELECT * FROM Users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) return done(err);
      if (!results.length) return done(null, false, { message: 'User not found' });

      const user = results[0];

      if (!user.verified) {
        return done(null, false, { message: 'Please verify your email first' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    });
  }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  const name = profile.displayName;

  // Check if user exists by email only
  const query = 'SELECT * FROM Users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return done(err);

    if (results.length > 0) {
      // User exists
      return done(null, results[0]);
    } else {
      const insertQuery = 'INSERT INTO Users (name, email, verified) VALUES (?, ?, ?)';
      db.query(insertQuery, [name, email, true], (err, insertResult) => {
        if (err) return done(err);

        // Retrieve the new user record
        db.query('SELECT * FROM Users WHERE id = ?', [insertResult.insertId], (err, newUser) => {
          if (err) return done(err);
          return done(null, newUser[0]);
        });
      });
    }
  });
}));

// Serialize user to session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from session
passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM Users WHERE id = ?', [id], (err, results) => {
    if (err) return done(err);
    return done(null, results[0]);
  });
});

module.exports = passport;
