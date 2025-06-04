// auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form[action="/login"]');
    const signupForm = document.querySelector('form[action="/submit"]'); // Updated to match backend
    const forgotForm = document.querySelector('form[action="/forgot-password"]');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
});

// Handle Login
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

// Handle Signup
function handleSignup(event) {
    event.preventDefault();

    const form = event.target;
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const role = form.role.value;

    if (!username || !email || !password || !role) {
        alert("Please fill in all fields.");
        return;
    }

    // Send POST request to server
    fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            alert(data.message); // Show welcome message
            window.location.href = "/login"; // Redirect to login page
        } else {
            alert("Something went wrong.");
        }
    })
    .catch(err => {
        console.error("Signup error:", err);
        alert("Server error occurred.");
    });
}

// Handle Forgot Password
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
