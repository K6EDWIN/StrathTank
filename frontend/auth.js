// auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form[action="/login"]');
    const signupForm = document.querySelector('form[action="/registration"]');
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

    // Example: Send to backend
    console.log("Logging in:", { username, password });

    // Redirect to homepage on success (simulate)
    window.location.href = "homepage.html";
}

// Handle Signup
function handleSignup(event) {
    event.preventDefault();
    const username = event.target.username.value.trim();
    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();

    if (!username || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    console.log("Signing up:", { username, email, password });
    window.location.href = "login.html";
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
    redirectTo("Login.html");
}
