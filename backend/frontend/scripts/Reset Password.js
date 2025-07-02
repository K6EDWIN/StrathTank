document.addEventListener('DOMContentLoaded', () => {
  // Pre-fill email field from URL query parameter if present
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email');
  if (email) {
    const emailField = document.getElementById('emailField');
    if (emailField) emailField.value = email;
  }

  const form = document.getElementById('resetPasswordForm');
  const resultMessage = document.getElementById('resultMessage');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const resetCode = form.resetCode.value.trim();
    const newPassword = form.newPassword.value.trim();
    const email = form.email.value.trim();

    // Clear previous message
    if (resultMessage) resultMessage.textContent = '';

    try {
      const res = await fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });

      const message = await res.text();

      if (resultMessage) resultMessage.textContent = message;

      if (res.ok) {
        // Redirect on success
        window.location.href = '/login';
      }
    } catch (err) {
      if (resultMessage) resultMessage.textContent = 'Error resetting password.';
      console.error('Password reset error:', err);
    }
  });
});
