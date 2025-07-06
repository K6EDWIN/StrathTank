// ----------------------------------------
// Popup modal helpers
// ----------------------------------------
function showPopup(message, showSpinner = false, showClose = true) {
  const modal = document.getElementById('popupModal');
  const msg = document.getElementById('popupMessage');
  const spinner = document.getElementById('popupSpinner');
  const closeBtn = document.getElementById('popupClose');

  if (!modal || !msg || !spinner || !closeBtn) return;

  msg.textContent = message || '';
  spinner.classList.toggle('hidden', !showSpinner);
  closeBtn.classList.toggle('hidden', !showClose);

  modal.classList.remove('hidden');
}

function hidePopup() {
  const modal = document.getElementById('popupModal');
  if (modal) modal.classList.add('hidden');
}

// ----------------------------------------
// Multi-step form navigation
// ----------------------------------------
function goToStep2() {
  document.getElementById('step1').style.display = 'none';
  document.getElementById('step2').style.display = 'block';
}

function goToStep1() {
  document.getElementById('step2').style.display = 'none';
  document.getElementById('step1').style.display = 'block';
}

// ----------------------------------------
// Handle signup (REGISTER FLOW)
// ----------------------------------------
function handleSignup(event) {
  event.preventDefault();

  const form = event.target;
  const username = form.username.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const role = form.role.value;
  const skills = form.skills ? form.skills.value.trim() : "";
  const messageBox = document.getElementById('message');
  messageBox.innerHTML = "";

  if (!username || !email || !password || !confirmPassword || !role) {
    showPopup("Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    showPopup("Passwords do not match.");
    return;
  }

  showPopup("Signing you up...", true, false);

  fetch("/user/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, role, skills })
  })
  .then(async res => {
    if (res.status === 409) {
      hidePopup();
      messageBox.style.color = "red";
      messageBox.innerHTML = `
        Username or email already exists. Please 
        <a href="/login" style="color: blue; text-decoration: underline;">sign in</a>.
      `;
      return;
    }

    const data = await res.json();

    if (data.success) {
      showPopup("✅ Successful signup!", false, false);
      setTimeout(() => {
        showPopup("Proceeding to verification...", true, false);
      }, 1500);
      setTimeout(() => {
        window.location.href = data.redirect;
      }, 3500);
    } else {
      hidePopup();
      showPopup("Something went wrong. Please try again.");
    }
  })
  .catch(err => {
    console.error("Signup error:", err);
    hidePopup();
    showPopup("Server error occurred. Please try again.");
  });
}

// ----------------------------------------
// Handle login
// ----------------------------------------
function handleLogin(event) {
  event.preventDefault();

  const username = event.target.username.value.trim();
  const password = event.target.password.value.trim();
  const messageBox = document.getElementById('login-message');
  messageBox.innerText = "";

  if (!username || !password) {
    showPopup("Please fill in all fields.");
    return;
  }

  showPopup("Logging you in...", true, false);

  fetch("/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok || !data.success) {
      hidePopup();
      showPopup(data.message || "Invalid username or password.");
      return;
    }
    showPopup("Welcome!", false, false);
    setTimeout(() => window.location.href = "/dashboard", 1500);
  })
  .catch(err => {
    console.error("Login error:", err);
    hidePopup();
    showPopup("Server error. Please try again.");
  });
}

// ----------------------------------------
// Handle forgot password
// ----------------------------------------
function handleForgotPassword(event) {
  event.preventDefault();
  const email = event.target.email.value.trim();

  if (!email) {
    showPopup("Please enter your email.");
    return;
  }

  showPopup("Processing request...", true, false);

  // Simulated server request (replace with real POST if needed)
  setTimeout(() => {
    hidePopup();
    showPopup("If this email exists, a reset link has been sent.", false, true);
    setTimeout(() => window.location.href = "/login", 3000);
  }, 1500);
}

// ----------------------------------------
// Social login role modal (with skills)
// ----------------------------------------
function submitSocialRole() {
  const roleSelect = document.getElementById('socialRoleSelect');
  const skillsInput = document.getElementById('socialSkills');

  const role = roleSelect.value.trim();
  let skills = '';

  if (!role) {
    showPopup("Please choose a role.");
    return;
  }

  if (role.toLowerCase() === 'student' || role.toLowerCase() === 'mentor') {
    skills = skillsInput ? skillsInput.value.trim() : '';
    if (!skills) {
      showPopup("Please enter your skills.");
      return;
    }
  }

  showPopup("Saving role...", true, false);

  fetch('/user/set-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, skills })
  })
  .then(res => {
    if (res.ok) {
      showPopup("Role saved! Redirecting...", false, false);
      setTimeout(() => window.location.href = '/dashboard', 1500);
    } else {
      hidePopup();
      showPopup("Failed to set role. Try again.");
    }
  })
  .catch(() => {
    hidePopup();
    showPopup("Server error. Please try again.");
  });
}

// ----------------------------------------
// DOMContentLoaded bootstrapping
// ----------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Close popup button
  const closeBtn = document.getElementById('popupClose');
  if (closeBtn) closeBtn.addEventListener('click', hidePopup);

  // Forms
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

  // Role and skills display logic
  const roleSelect = document.getElementById('role');
  const skillsGroup = document.getElementById('skillsGroup');

  if (roleSelect && skillsGroup) {
    roleSelect.addEventListener('change', () => {
      const selectedRole = roleSelect.value.toLowerCase();
      if (selectedRole === 'student' || selectedRole === 'mentor') {
        skillsGroup.style.display = 'block';
      } else {
        skillsGroup.style.display = 'none';
      }
    });
  }

  // Social login role modal display logic
  if (window.location.search.includes('showRoleModal=true')) {
    const modal = document.getElementById('roleModal');
    if (modal) modal.style.display = 'flex';

    const socialRoleSelect = document.getElementById('socialRoleSelect');
    const socialSkillsGroup = document.getElementById('socialSkillsGroup');

    if (socialRoleSelect && socialSkillsGroup) {
      socialRoleSelect.addEventListener('change', () => {
        const selected = socialRoleSelect.value.toLowerCase();
        if (selected === 'student' || selected === 'mentor') {
          socialSkillsGroup.style.display = 'block';
        } else {
          socialSkillsGroup.style.display = 'none';
        }
      });
    }
  }
});
