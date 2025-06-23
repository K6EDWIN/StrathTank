const express = require('express');
const router = express.Router();
const db = require('../config/db');
const transporter = require('../config/mailer');

// ✅ Send a collaboration request
router.post('/:projectId/request', async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const userId = req.session?.user?.id;

  if (!userId) return res.status(401).json({ error: "Unauthorized. Please log in." });

  try {
    // Check if already requested
    const [existing] = await db.promise().query(
      `SELECT * FROM collaborations WHERE project_id = ? AND collaborator_id = ?`,
      [projectId, userId]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: "You've already requested collaboration." });

    // Get project and owner info
    const [projectData] = await db.promise().query(
      `SELECT p.title, u.email, u.name AS owner_name, u.id AS owner_id
       FROM projects p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [projectId]
    );
    if (projectData.length === 0)
      return res.status(404).json({ error: "Project not found." });

    const { title, email, owner_id } = projectData[0];
    if (owner_id === userId)
      return res.status(400).json({ error: "You cannot collaborate on your own project." });

    // Get requester's name
    const [userData] = await db.promise().query(
      `SELECT name FROM users WHERE id = ?`,
      [userId]
    );
    const requesterName = userData[0]?.name || 'Someone';

    // Insert collaboration record
    await db.promise().query(
      `INSERT INTO collaborations (project_id, collaborator_id, status) VALUES (?, ?, 'pending')`,
      [projectId, userId]
    );

    // Email with response links
    const base = process.env.BASE_URL;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `🤝 ${requesterName} wants to collaborate on "${title}"`,
      html: `
        <p><strong>${requesterName}</strong> is requesting to collaborate with you on the project <strong>"${title}"</strong>.</p>
        <p>
          <a href="${base}/api/collaboration/response?projectId=${projectId}&userId=${userId}&action=accept">✅ Accept</a> |
          <a href="${base}/api/collaboration/response?projectId=${projectId}&userId=${userId}&action=decline">❌ Decline</a> |
          <a href="${base}/otherProfile?userId=${userId}">👤 View Profile</a>
        </p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Collaboration request sent!' });

  } catch (err) {
    console.error('❌ Error in collaboration request:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Handle accept/decline action from email
router.get('/response', async (req, res) => {
  const { projectId, userId, action } = req.query;

  if (!projectId || !userId || !['accept', 'decline'].includes(action)) {
    return res.status(400).send("Invalid response link.");
  }

  const status = action === 'accept' ? 'accepted' : 'declined';

  try {
    await db.promise().query(
      `UPDATE collaborations SET status = ? WHERE project_id = ? AND collaborator_id = ?`,
      [status, projectId, userId]
    );

    // Redirect to visual confirmation page
    return res.redirect(`/api/collaboration/response-status?status=${status}`);
  } catch (err) {
    console.error("❌ Error updating collaboration status:", err);
    res.status(500).send("Server error while processing your response.");
  }
});

// ✅ Final status page with popup and redirect
router.get('/response-status', (req, res) => {
  const status = req.query.status;

  let message = '';
  if (status === 'accepted') {
    message = '✅ You have accepted the collaboration request.';
  } else if (status === 'declined') {
    message = '❌ You have declined the collaboration request.';
  } else {
    message = '⚠️ Unknown collaboration response.';
  }

  res.send(`
    <html>
      <head>
        <title>Collaboration Response</title>
        <script>
          alert("${message}");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 3000);
        </script>
      </head>
      <body>
        <h2 style="text-align:center;margin-top:20%;">${message}<br/>Redirecting to dashboard...</h2>
      </body>
    </html>
  `);
});

module.exports = router;
