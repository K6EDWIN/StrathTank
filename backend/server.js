require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'Registration.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'Registration.html'));
});
app.post('/submit', async (req, res) => {
    const {
        username, email, password,role
    } = req.body;

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL query to insert form data into the personal_information table
        const query = `
            INSERT INTO Users (
                name,email,password,role)
            ) VALUES (?, ?, ?,?)
        `;

        // Insert data into the database
        pool.query(query, [
             username, email, hashedPassword,role
        ], (err, results) => {
            if (err) {
                console.error('Error inserting data into the database:', err);
                res.status(500).json({ message: 'An error occurred while saving your information.' });
                return;
            }
            // Send a success response
            res.status(200).json({ message: 'Signing up successful. Welcome to strathtank' });
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
