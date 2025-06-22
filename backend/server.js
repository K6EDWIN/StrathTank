// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./middleware/passport');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route registration
app.use('/', require('./routes/static'));
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/user'));
app.use('/api', require('./routes/project'));


// Static assets
app.use('/styles', express.static(path.join(__dirname, 'frontend/styles')));
app.use('/assets', express.static(path.join(__dirname, 'frontend/assets')));
app.use('/scripts', express.static(path.join(__dirname, 'frontend/scripts')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://10.0.194.89:${PORT}`);
});
