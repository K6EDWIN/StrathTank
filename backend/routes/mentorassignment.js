const express = require('express');
const router = express.Router();
const db = require('../config/db');
const transporter = require('../config/mailer');

// POST /api/mentorship/auto-assign/:requestId
router.post('/auto-assign/:requestId', (req, res) => {
  const { requestId } = req.params;

  // Step 1: Get mentorship request
  const requestSql = `SELECT * FROM mentorship_requests WHERE id = ?`;

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

    // Step 2: Find a suitable mentor
    const mentorSql = `
      SELECT * FROM Users 
      WHERE role = 'mentor' 
        AND (skills LIKE ? OR skills LIKE ? OR skills LIKE ?) 
        AND id != ?
      ORDER BY RAND() 
      LIMIT 1
    `;

    const area = `%${primaryArea}%`;

    db.query(mentorSql, [area, `%${primaryArea.toLowerCase()}%`, `%${primaryArea.toUpperCase()}%`, request.mentee_id], (err, mentors) => {
      if (err) {
        console.error('❌ Error searching mentor:', err);
        return res.status(500).json({ success: false, message: 'Database error while matching mentor' });
      }

      if (!mentors.length) {
        return res.status(404).json({ success: false, message: 'No suitable mentor found' });
      }

      const mentor = mentors[0];

      // Step 3: Update mentorship request with assigned mentor
      const assignSql = `UPDATE mentorship_requests SET mentor_id = ?, status = 'assigned' WHERE id = ?`;

      db.query(assignSql, [mentor.id, requestId], (err) => {
        if (err) {
          console.error('❌ Error assigning mentor:', err);
          return res.status(500).json({ success: false, message: 'Could not assign mentor' });
        }

        // Step 4: Send email to the mentor
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
          <p>Please login to your mentor dashboard to view and follow up.</p>
          <p>Thanks,<br/>Strathtank Team</p>
        `;

        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: mentor.email,
          subject: 'New Mentorship Assignment - Strathtank',
          html: emailHtml
        }, (err, info) => {
          if (err) {
            console.error('❌ Email sending failed:', err);
            return res.status(500).json({
              success: false,
              message: 'Mentor assigned but email failed to send'
            });
          }

          return res.json({
            success: true,
            message: 'Mentor assigned and notified successfully',
            mentor: {
              id: mentor.id,
              name: mentor.name,
              email: mentor.email
            }
          });
        });
      });
    });
  });
});

module.exports = router;
