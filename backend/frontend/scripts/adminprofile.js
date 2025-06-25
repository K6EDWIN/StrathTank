const profilePic = document.getElementById('adminProfilePic');
const profilePicInput = document.getElementById('profilePicInput');
const editIcon = document.getElementById('editIcon');

// Show edit icon on hover
profilePic.addEventListener('mouseenter', () => editIcon.style.display = 'block');
profilePic.addEventListener('mouseleave', () => {
  setTimeout(() => {
    if (!editIcon.matches(':hover')) editIcon.style.display = 'none';
  }, 100);
});
editIcon.addEventListener('mouseenter', () => editIcon.style.display = 'block');
editIcon.addEventListener('mouseleave', () => editIcon.style.display = 'none');
editIcon.addEventListener('click', () => profilePicInput.click());

// Upload image
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
      const fixedPath = result.profile_image.replace(/\\/g, '/');
      profilePic.src = `/${fixedPath}?t=${Date.now()}`;
      alert('Profile picture updated!');
    } else {
      alert(result.message || 'Upload failed');
    }
  } catch (err) {
    console.error('Upload error:', err);
    alert('Failed to upload profile picture.');
  }
});

// Load profile
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
    console.error(err);
    alert('Error loading profile.');
  }
}

// Change password
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
    alert('Error changing password.');
    console.error(error);
  }
});

// Delete account
document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
  const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
  if (!confirmDelete) return;

  try {
    const res = await fetch('/admin/delete-account', { method: 'DELETE', credentials: 'include' });
    const result = await res.json();
    if (result.success) {
      alert('Account deleted. Logging out...');
      window.location.href = '/logout';
    } else {
      alert('Failed to delete account.');
    }
  } catch (error) {
    alert('Error deleting account.');
    console.error(error);
  }
});

window.addEventListener('DOMContentLoaded', loadAdminProfile);
