document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotPasswordForm');
  const dialog = document.getElementById('confirmDialog');
  const statusBox = document.getElementById('statusBox');
  const statusText = document.getElementById('statusText');
  const userEmailDisplay = document.getElementById('userEmailDisplay');

  const cancelBtn = document.getElementById('cancelBtn');
  const proceedBtn = document.getElementById('proceedBtn');

  let email = '';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    email = form.email.value.trim();
    if (!email) return;

    // Show confirmation dialog
    userEmailDisplay.textContent = email;
    dialog.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    dialog.classList.add('hidden');
  });

  proceedBtn.addEventListener('click', async () => {
    dialog.classList.add('hidden');
    statusBox.classList.remove('hidden');
    statusText.textContent = 'Sending verification code...';

    try {
      const res = await fetch('/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error();

      await new Promise((resolve) => setTimeout(resolve, 1200)); // spinner delay
      statusText.textContent = 'Verification code sent to your email.';

      setTimeout(() => {
        window.location.href = `/reset-password?email=${encodeURIComponent(email)}`;

      }, 2000);

    } catch (err) {
      statusText.textContent = 'Error sending verification code. Try again.';
      setTimeout(() => statusBox.classList.add('hidden'), 2500);
    }
  });
});
