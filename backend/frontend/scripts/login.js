// ==========================
// ✅ DOM Elements
// ==========================
const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('login-message');
const loader = document.getElementById('login-loader'); // Spinner element

// ==========================
// ✅ Handle Email/Password Login Submission
// ==========================
loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  loader.style.display = 'flex'; // Show spinner during login process

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('[LOGIN RESPONSE]', data);

    if (data.success) {
      messageDiv.textContent = '✅ Successful! Welcome to your Dashboard.';
      messageDiv.style.color = 'green';

      // Brief delay before redirect to keep spinner visible
      setTimeout(() => {
        window.location.href = data.redirectUrl || '/dashboard';
      }, 1500);
    } else {
      loader.style.display = 'none';
      messageDiv.textContent = data.message;
      messageDiv.style.color = 'red';
    }
  } catch (err) {
    loader.style.display = 'none';
    console.error('Login error:', err);
    messageDiv.textContent = '⚠️ An error occurred during login.';
    messageDiv.style.color = 'red';
  }
});

// ==========================
// ✅ Clear login message on input
// ==========================
loginForm.addEventListener('input', () => {
  messageDiv.textContent = '';
});

// ==========================
// ✅ Handle Social Logins with Spinner
// ==========================
const googleBtn = document.getElementById('Google');
const githubBtn = document.getElementById('Github');

if (googleBtn) {
  googleBtn.addEventListener('click', () => {
    loader.style.display = 'flex'; // Show spinner before redirect
    setTimeout(() => {
      window.location.href = '/auth/google';
    }, 1000); // Delay for better UX
  });
}

if (githubBtn) {
  githubBtn.addEventListener('click', () => {
    loader.style.display = 'flex'; // Show spinner before redirect
    setTimeout(() => {
      window.location.href = '/auth/github';
    }, 1000); // Delay for better UX
  });
}
