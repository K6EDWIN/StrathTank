document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotPasswordForm');

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
      document.getElementById('message').textContent = data;

      if (res.ok) {
        window.location.href = `/reset-password.html?email=${encodeURIComponent(email)}`;
      }
    } catch (err) {
      document.getElementById('message').textContent = 'Error sending reset code.';
    }
  });
});
