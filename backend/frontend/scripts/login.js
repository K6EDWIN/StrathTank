const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('login-message');

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    messageDiv.textContent = '✅ Successful! Welcome to Dashboard.';
    messageDiv.style.color = 'green';
    // Redirect after 2 seconds, customize as needed
    setTimeout(() => {
      window.location.href = '/dashboard'; // Change to your actual dashboard route
    }, 2000);
  } else {
    messageDiv.textContent = data.message;
    messageDiv.style.color = 'red';
  }
});

// Optional: Clear messages when user starts typing
loginForm.addEventListener('input', () => {
  messageDiv.textContent = '';
});
