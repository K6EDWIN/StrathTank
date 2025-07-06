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

// ==========================
// ✅ Open file input when edit icon clicked
// ==========================
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

// =====================================================
// ✅ Logout Flow with Spinner
// =====================================================
function openLogoutConfirm() {
  const modal = document.getElementById('logout-confirm-modal');
  if (modal) modal.style.display = 'flex';
}

function closeLogoutConfirm() {
  const modal = document.getElementById('logout-confirm-modal');
  if (modal) modal.style.display = 'none';
}

function showLogoutLoader() {
  const loader = document.getElementById('logout-loader');
  if (loader) loader.style.display = 'flex';
}

function hideLogoutLoader() {
  const loader = document.getElementById('logout-loader');
  if (loader) loader.style.display = 'none';
}

function logout() {
  closeLogoutConfirm();
  showLogoutLoader();

  const minDelay = new Promise(resolve => setTimeout(resolve, 1500)); 
  const logoutRequest = fetch('/user/logout', {
    method: 'GET',
    credentials: 'include'
  });

  Promise.all([minDelay, logoutRequest])
    .then(([_, res]) => {
      if (res.redirected) {
        window.location.href = res.url;
      } else {
        hideLogoutLoader();
        alert('Logout failed.');
      }
    })
    .catch(err => {
      hideLogoutLoader();
      console.error('Logout error:', err);
      alert('An error occurred during logout.');
    });
}


// ==========================
// ✅ Initialize profile data and modal button events on DOM ready
// ==========================
window.addEventListener('DOMContentLoaded', () => {
  loadAdminProfile();
    setupNameModal();

  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

  if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', logout);
  if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', closeLogoutConfirm);
});

function setupNameModal() {
  const nameModal = document.getElementById('nameModal');
  const nameInput = document.getElementById('nameInput');
  const nameDisplay = document.getElementById('adminName');
  const saveBtn = document.getElementById('saveNameBtn');

  document.getElementById('editNameBtn')?.addEventListener('click', () => {
    nameInput.value = nameDisplay.textContent.trim();
    nameModal.style.display = 'flex';
  });

  document.getElementById('closeNameModal')?.addEventListener('click', () => {
    nameModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === nameModal) nameModal.style.display = 'none';
  });

  saveBtn?.addEventListener('click', async () => {
    const newName = nameInput.value.trim();
    if (!newName) return;

    const loader = document.getElementById('nameUpdateLoader');
    const message = document.getElementById('nameUpdateMessage');

    message.textContent = 'Updating name...';
    loader.style.display = 'flex';

    try {
      const res = await fetch(`/user/name`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });

      if (!res.ok) throw new Error('Failed to update name');

      nameDisplay.textContent = newName;
      message.textContent = '✅ Name updated!';

      setTimeout(() => {
        loader.style.display = 'none';
        nameModal.style.display = 'none';
      }, 1500);
    } catch (err) {
      console.error('Name update error:', err);
      message.textContent = '❌ Failed to update name.';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 2000);
    }
  });
}
