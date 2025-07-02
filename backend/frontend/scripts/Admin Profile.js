// ==========================
// ✅ DOM elements references
// ==========================
const profilePic = document.getElementById('adminProfilePic');
const profilePicInput = document.getElementById('profilePicInput');
const editIcon = document.getElementById('editIcon');

// ==========================
// ✅ Show/hide edit icon on profile picture hover
// ==========================
profilePic.addEventListener('mouseenter', () => editIcon.style.display = 'block');
profilePic.addEventListener('mouseleave', () => {
  setTimeout(() => {
    if (!editIcon.matches(':hover')) editIcon.style.display = 'none';
  }, 100);
});
editIcon.addEventListener('mouseenter', () => editIcon.style.display = 'block');
editIcon.addEventListener('mouseleave', () => editIcon.style.display = 'none');

// Open file input when edit icon clicked
editIcon.addEventListener('click', () => profilePicInput.click());

// ==========================
// ✅ Upload profile picture
// ==========================
profilePicInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('profile_picture', file);

  try {
    const res = await fetch('/admin/profile-picture', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const result = await res.json();

    if (res.ok && result.success) {
      // Fix Windows-style backslashes in path, cache bust with timestamp
      const fixedPath = result.profile_image.replace(/\\/g, '/');
      profilePic.src = `/${fixedPath}?t=${Date.now()}`;
      alert('Profile picture updated!');
    } else {
      alert(result.message || 'Upload failed');
    }
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    alert('Failed to upload profile picture.');
  }
});

// ==========================
// ✅ Load admin profile data on page load
// ==========================
async function loadAdminProfile() {
  try {
    const res = await fetch('/admin/profile/info');
    const data = await res.json();

    if (data.success) {
      document.getElementById('adminName').innerText = data.user.name;
      document.getElementById('adminEmail').innerText = data.user.email;
      if (data.user.profile_image) {
        const fixedPath = data.user.profile_image.replace(/\\/g, '/');
        profilePic.src = `/${fixedPath}`;
      }
    } else {
      alert('Could not load profile');
    }
  } catch (err) {
    console.error('[LOAD PROFILE ERROR]', err);
    alert('Error loading profile.');
  }
}

// ==========================
// ✅ Handle change password form submission
// ==========================
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    alert('New passwords do not match.');
    return;
  }

  try {
    const response = await fetch('/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: 'include'
    });

    const result = await response.json();

    if (result.success) {
      alert('Password updated successfully.');
      document.getElementById('changePasswordForm').reset();
    } else {
      alert(result.message || 'Failed to change password.');
    }
  } catch (error) {
    console.error('[CHANGE PASSWORD ERROR]', error);
    alert('Error changing password.');
  }
});

// ==========================
// ✅ Handle delete account button click
// ==========================
document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
  const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
  if (!confirmDelete) return;

  try {
    const res = await fetch('/admin/delete-account', {
      method: 'DELETE',
      credentials: 'include'
    });
    const result = await res.json();

    if (result.success) {
      alert('Account deleted. Logging out...');
      window.location.href = '/logout';
    } else {
      alert('Failed to delete account.');
    }
  } catch (error) {
    console.error('[DELETE ACCOUNT ERROR]', error);
    alert('Error deleting account.');
  }
});

// ==========================
// ✅ Initialize profile data on DOM ready
// ==========================
window.addEventListener('DOMContentLoaded', loadAdminProfile);

// ==========================
// ✅ Logout user with loader and redirect handling
// ==========================
function logoutUser() {
  // Show logout loader
  const loader = document.getElementById('logout-loader');
  loader.style.display = 'flex';

  // Optional delay for better UX (e.g., 1.5 seconds)
  setTimeout(() => {
    fetch('/user/logout', {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => {
        if (res.redirected) {
          window.location.href = res.url;
        } else {
          loader.style.display = 'none'; // hide loader
          alert('Logout failed.');
        }
      })
      .catch(err => {
        loader.style.display = 'none'; // hide loader
        console.error('[LOGOUT ERROR]', err);
        alert('Error logging out.');
      });
  }, 1500); // Show loader before logging out
}
