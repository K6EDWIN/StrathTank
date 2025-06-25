const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('login-message');

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  console.log('[LOGIN RESPONSE]', data); // 🔍 Confirm what backend sends

  if (data.success) {
    messageDiv.textContent = '✅ Successful! Welcome to your Dashboard.';
    messageDiv.style.color = 'green';
    setTimeout(() => {
      window.location.href = data.redirectUrl || '/dashboard'; // ✅ Use backend-provided URL
    }, 2000);
  } else {
    messageDiv.textContent = data.message;
    messageDiv.style.color = 'red';
  }
});

loginForm.addEventListener('input', () => {
  messageDiv.textContent = '';
});

const googleBtn = document.getElementById('Google');
const githubBtn = document.getElementById('Github');

if (googleBtn) {
  googleBtn.addEventListener('click', () => {
    window.location.href = '/auth/google';
  });
}

if (githubBtn) {
  githubBtn.addEventListener('click', () => {
    window.location.href = '/auth/github';
  });
}
