document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email');
  const emailField = document.getElementById('emailField');
  const form = document.getElementById('resetPasswordForm');
  const resultMessage = document.getElementById('resultMessage');
  const confirmInput = document.getElementById('confirmPassword');
  const strengthText = document.getElementById('strengthText');
  const statusOverlay = document.getElementById('statusOverlay');
  const statusText = document.getElementById('statusText');

  if (email && emailField) emailField.value = email;

  // =============== Password Strength Meter ===============
  document.getElementById('newPassword').addEventListener('input', (e) => {
    const val = e.target.value;
    let strength = 'weak';
    if (val.length > 8 && /[A-Z]/.test(val) && /[\d\W]/.test(val)) {
      strength = 'strong';
    } else if (val.length >= 6) {
      strength = 'medium';
    }

    strengthText.textContent = strength;
    strengthText.className = strength;
  });

  // =============== Password Validation Function ===============
  function validatePassword(password) {
    const common = [
      '1234', '123456', 'password', 'qwerty', '111111', 'abc123',
      'letmein', '123123', 'qwerty123', 'qazwsx', 'welcome',
      'admin', 'passw0rd', '12345678','passwad'
    ];

    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter.';
    if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must include a number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must include a special character.';
    if (common.includes(password.toLowerCase())) return 'That password is too common. Choose a stronger one.';

    return null;
  }

  // =============== Form Submission Handler ===============
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const resetCode = form.resetCode.value.trim();
    const newPassword = form.newPassword.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();
    const email = form.email.value.trim();

    resultMessage.textContent = '';

    if (newPassword !== confirmPassword) {
      resultMessage.textContent = 'Passwords do not match.';
      return;
    }

    // 🚫 Password format validation
    const validationMessage = validatePassword(newPassword);
    if (validationMessage) {
      resultMessage.textContent = validationMessage;
      return;
    }

    // 🔁 Check if password is reused (via backend)
    try {
      const reuseRes = await fetch('/user/check-password-reuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });

      const reuseResult = await reuseRes.json();

      if (reuseResult.reused) {
        // 🚫 Show error dialog
        showReusedPasswordDialog();
        return;
      }
    } catch (err) {
      console.error('Reuse check failed:', err);
      resultMessage.textContent = 'Something went wrong. Try again later.';
      return;
    }

    // ✅ Show Spinner
    statusOverlay.classList.remove('hidden');
    statusText.textContent = 'Changing password...';

    try {
      const res = await fetch('/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode, newPassword })
      });

      const message = await res.text();

      if (res.ok) {
        statusText.textContent = 'Password changed. Redirecting to login...';
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        statusOverlay.classList.add('hidden');
        resultMessage.textContent = message;
      }
    } catch (err) {
      statusOverlay.classList.add('hidden');
      resultMessage.textContent = 'Error resetting password.';
      console.error(err);
    }
  });

  // =============== Dialog for Reused Password ===============
  function showReusedPasswordDialog() {
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.background = 'white';
    dialog.style.padding = '20px';
    dialog.style.border = '1px solid #ccc';
    dialog.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    dialog.style.zIndex = '1000';
    dialog.style.textAlign = 'center';
    dialog.innerHTML = `
      <p style="margin-bottom: 20px;">New password cannot be the same as your old password.</p>
      <button id="backButton">Back</button>
    `;
    document.body.appendChild(dialog);

    document.getElementById('backButton').addEventListener('click', () => {
      dialog.remove();
    });
  }
});
