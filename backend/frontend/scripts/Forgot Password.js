// ==========================
// ✅ Wait for DOM to load
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotPasswordForm');

  // ==========================
  // ✅ Handle forgot password form submission
  // ==========================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value;

    try {
      const res = await fetch('/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.text();

      // Display response message
      document.getElementById('message').textContent = data;

      // Redirect to reset password page if successful
      if (res.ok) {
        window.location.href = `/reset-password.html?email=${encodeURIComponent(email)}`;
      }
    } catch (err) {
      // Show error message on failure
      document.getElementById('message').textContent = 'Error sending reset code.';
    }
  });
});
