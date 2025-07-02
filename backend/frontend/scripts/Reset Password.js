document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email');
  if (email) {
    document.getElementById('emailField').value = email;
  }

  const form = document.getElementById('resetPasswordForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const resetCode = form.resetCode.value;
    const newPassword = form.newPassword.value;
    const email = form.email.value;
    const resultMessage = document.getElementById('resultMessage');

    try {
      const res = await fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode, newPassword })
      });

      const message = await res.text();

      resultMessage.textContent = message;

      if (res.ok) {

          window.location.href = '/login';
        
      }
    } catch (err) {
      resultMessage.textContent = 'Error resetting password.';
    }
  });
});
