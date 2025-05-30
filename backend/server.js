require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;
// Create MySQL connection using env variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('❌ DB connection error:', err.message);
  } else {
    console.log('✅ Connected bruh');
  }
});

// Example route
app.get('/', (req, res) => {
  res.send('Hello from server with env vars!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
