document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('login-message');

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    messageDiv.textContent = '✅ Successful! Welcome to Dashboard.';
    messageDiv.style.color = 'green';
  } else {
    messageDiv.textContent = data.message;
    messageDiv.style.color = 'red';
  }
});
