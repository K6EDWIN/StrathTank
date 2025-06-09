document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form[action="/login"]');
    const signupForm = document.querySelector('form[action="/submit"]');
    const forgotForm = document.querySelector('form[action="/forgot-password"]');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (forgotForm) forgotForm.addEventListener('submit', handleForgotPassword);

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            document.getElementById('message').innerText = "";
        });
    }

    // Role modal after social login
    if (window.location.search.includes('showRoleModal=true')) {
        const modal = document.getElementById('roleModal');
        if (modal) modal.style.display = 'flex';
    }
});

// Multi-step form navigation
function goToStep2() {
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
}

function goToStep1() {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    const username = event.target.username.value.trim();
    const password = event.target.password.value.trim();

    if (!username || !password) {
        alert("Please fill in all fields.");
        return;
    }

    console.log("Logging in:", { username, password });
    window.location.href = "homepage.html";
}

// Handle signup
function handleSignup(event) {
    event.preventDefault();

    const form = event.target;
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const role = form.role.value;

    const messageBox = document.getElementById('message');

    if (!username || !email || !password || !confirmPassword || !role) {
        messageBox.innerText = "Please fill in all fields.";
        messageBox.style.color = "red";
        return;
    }

    if (password !== confirmPassword) {
        messageBox.innerText = "Passwords do not match.";
        messageBox.style.color = "red";
        return;
    }

    fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            window.location.href = "/login";
        } else {
            messageBox.innerText = "Something went wrong.";
            messageBox.style.color = "red";
        }
    })
    .catch(err => {
        console.error("Signup error:", err);
        messageBox.innerText = "Server error occurred.";
        messageBox.style.color = "red";
    });
}

// Handle forgot password
function handleForgotPassword(event) {
    event.preventDefault();
    const email = event.target.email.value.trim();

    if (!email) {
        alert("Please enter your email.");
        return;
    }

    console.log("Password reset requested for:", email);
    alert("If this email exists, a reset link has been sent.");
    window.location.href = "login.html";
}

// Social login role modal
function submitRole(role) {
    fetch('/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
    }).then(res => {
        if (res.ok) {
            window.location.href = '/dashboard';
        } else {
            alert("Failed to set role. Try again.");
        }
    });
}
