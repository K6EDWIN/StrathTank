const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('login-message');

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});


  const data = await response.json();

  if (data.success) {
    messageDiv.textContent = '✅ Successful! Welcome to your Dashboard.';
    messageDiv.style.color = 'green';
    // Redirect after 2 seconds, 
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  } else {
    messageDiv.textContent = data.message;
    messageDiv.style.color = 'red';
  }
});

// Clear messages when user starts typing
loginForm.addEventListener('input', () => {
  messageDiv.textContent = '';
});

// Social Login Redirects
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
