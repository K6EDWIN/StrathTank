const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 1000 * 60 * 60 * 2
});

module.exports = session({
  key: 'user_session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' // optional
  }
});
