// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const passport = require('./middleware/passport');
const session = require('./config/session');
const collaborationRoutes = require('./routes/collaboration');
const mentorshipRoutes = require('./routes/mentorship');


const app = express();
const PORT = process.env.PORT || 3000;
const adminRoutes = require('./routes/admin');



// ✅ Middleware
app.use(session); 
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Route registration
app.use('/', require('./routes/static'));
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/user'));
app.use('/api', require('./routes/project'));
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/mentorship', mentorshipRoutes); 
app.use('/admin', adminRoutes);




// ✅ Static assets
app.use('/styles', express.static(path.join(__dirname, 'frontend/styles')));
app.use('/assets', express.static(path.join(__dirname, 'frontend/assets')));
app.use('/scripts', express.static(path.join(__dirname, 'frontend/scripts')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));


// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
