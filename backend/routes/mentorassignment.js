// ====================================================
// IMPORTS & SETUP
// ====================================================
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const transporter = require('../config/mailer');

// ====================================================
// Auto-assign a mentor to a mentorship request
// ====================================================
router.post('/auto-assign/:requestId', (req, res) => {
  const { requestId } = req.params;

  // ----------------------------------------
  // 1️⃣ Fetch the mentorship request details
  // ----------------------------------------
  const requestSql = `
    SELECT * FROM mentorship_requests
    WHERE id = ?
  `;

  db.query(requestSql, [requestId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching request:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!results.length) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const request = results[0];
    const primaryArea = request.primary_area || '';

    // ----------------------------------------
    // 2️⃣ Search for a suitable mentor by skill
    // ----------------------------------------
    const mentorSql = `
      SELECT *
      FROM Users
      WHERE role = 'mentor'
        AND (
          skills LIKE ? OR
          skills LIKE ? OR
          skills LIKE ?
        )
        AND id != ?
      ORDER BY RAND()
      LIMIT 1
    `;

    const areaPattern = `%${primaryArea}%`;

    db.query(
      mentorSql,
      [areaPattern, `%${primaryArea.toLowerCase()}%`, `%${primaryArea.toUpperCase()}%`, request.mentee_id],
      (err, mentors) => {
        if (err) {
          console.error('❌ Error searching mentor:', err);
          return res.status(500).json({ success: false, message: 'Database error while matching mentor' });
        }

        if (!mentors.length) {
          return res.status(404).json({ success: false, message: 'No suitable mentor found' });
        }

        const mentor = mentors[0];

        // ----------------------------------------
        // 3️⃣ Assign mentor to the request
        // ----------------------------------------
        const assignSql = `
          UPDATE mentorship_requests
          SET mentor_id = ?, status = 'assigned'
          WHERE id = ?
        `;

        db.query(assignSql, [mentor.id, requestId], (err) => {
          if (err) {
            console.error('❌ Error assigning mentor:', err);
            return res.status(500).json({ success: false, message: 'Could not assign mentor' });
          }

          // ----------------------------------------
          // 4️⃣ Send email notification to mentor
          // ----------------------------------------
          const emailHtml = `
            <h2>🚀 New Mentorship Assignment</h2>
            <p>Hello <strong>${mentor.name}</strong>,</p>
            <p>You’ve been assigned a new mentorship request. Here are the details:</p>
            <ul>
              <li><strong>Subject:</strong> ${request.subject}</li>
              <li><strong>Challenge:</strong> ${request.challenge}</li>
              <li><strong>Primary Area:</strong> ${request.primary_area || 'Not specified'}</li>
              <li><strong>Preferred Skills:</strong> ${request.preferred_skills || 'N/A'}</li>
              <li><strong>Availability:</strong> ${request.availability || 'N/A'}</li>
            </ul>
            <p>Please log in to your mentor dashboard to view and follow up.</p>
            <p>Thanks,<br/>Strathtank Team</p>
          `;

          transporter.sendMail(
            {
              from: process.env.EMAIL_USER,
              to: mentor.email,
              subject: 'New Mentorship Assignment - Strathtank',
              html: emailHtml
            },
            (err) => {
              if (err) {
                console.error('❌ Email sending failed:', err);
                return res.status(500).json({
                  success: false,
                  message: 'Mentor assigned but email failed to send'
                });
              }

              // ✅ Success response
              return res.json({
                success: true,
                message: 'Mentor assigned and notified successfully',
                mentor: {
                  id: mentor.id,
                  name: mentor.name,
                  email: mentor.email
                }
              });
            }
          );
        });
      }
    );
  });
});

// ====================================================
// EXPORT ROUTER
// ====================================================
module.exports = router;
