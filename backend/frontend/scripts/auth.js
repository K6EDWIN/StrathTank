document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form[action="/login"]');
    const signupForm = document.querySelector('form[action="/submit"]');
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

    // Optional: clear error message on confirm password input
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            document.getElementById('message').innerText = "";
        });
    }
});

// Go to step 2 of form
function goToStep2() {
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
}

// Go back to step 1 of form
function goToStep1() {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
}

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

// Handle Signup (with confirm password check)
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

    // POST to server
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
