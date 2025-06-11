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
    const messageBox = document.getElementById('login-message'); // Add this in your HTML

    messageBox.innerText = "";

    if (!username || !password) {
        messageBox.innerText = "Please fill in all fields.";
        messageBox.style.color = "red";
        return;
    }

    fetch("/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(async res => {
        const data = await res.json();

        if (!res.ok || !data.success) {
            messageBox.innerText = data.message || "Invalid username or password.";
            messageBox.style.color = "red";
            return;
        }

        // Login successful
        alert("Welcome, " + data.user.name + "!");
        window.location.href = "/dashboard"; // Redirect to dashboard
        messageBox.innerText = "Login successful!";
    })
    .catch(err => {
        console.error("Login error:", err);
        messageBox.innerText = "Server error. Please try again.";
        messageBox.style.color = "red";
    });
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
    messageBox.innerHTML = ""; // Clear any previous messages

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

    fetch("/user/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role })
    })
    .then(async res => {
        if (res.status === 409) {
            // Show user-friendly message and sign-in link
            messageBox.style.color = "red";
            messageBox.innerHTML = `
                Username or email already exists. Please 
                <a href="/login" style="color: blue; text-decoration: underline;">sign in</a>.
            `;
            return;
        }

        const data = await res.json();

        if (data.success) {
            alert(data.message);
            window.location.href = data.redirect; // Redirect to verification
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
    window.location.href = "/login"; // Redirect to login page
}

// Social login role modal
function submitRole(role) {
    fetch('/user/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
    }).then(res => {
        if (res.ok) {
            window.location.href = '/user/dashboard';
        } else {
            alert("Failed to set role. Try again.");
        }
    });
}
