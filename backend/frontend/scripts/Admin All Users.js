// ✅ Wait for DOM content to load and initialize user list & search filter
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();

  // ✅ Live search
  const userSearchInput = document.getElementById("userSearch");
  if (userSearchInput) {
    userSearchInput.addEventListener("input", filterUsers);
  }

  // ✅ Logout modal button handlers
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

  if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', logout);
  if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', closeLogoutConfirm);
});

let allUsers = [];

// ==============================
// ✅ Fetch all users from the server
// ==============================
async function loadUsers() {
  try {
    const res = await fetch("/admin/allusers");
    const data = await res.json();

    if (!data.success) throw new Error("Failed to load users");

    allUsers = data.users;
    renderUsers(allUsers);
  } catch (err) {
    console.error("[LOAD USERS] Error loading users:", err);
  }
}

// ==============================
// ✅ Render users inside the table body
// ==============================
function renderUsers(users) {
  const tbody = document.getElementById("userTableBody");
  if (!tbody) return;

  tbody.innerHTML = ""; // Clear existing rows

  users.forEach(user => {
    const suspended = user.suspended === 1 || user.suspended === true;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>
        <button class="suspend-btn" data-id="${user.id}" data-suspended="${suspended}">
          ${suspended ? "Unsuspend" : "Suspend"}
        </button>
        <button class="delete-btn" data-id="${user.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  attachActionListeners();
}

// ==============================
// ✅ Attach event listeners to action buttons
// ==============================
function attachActionListeners() {
  document.querySelectorAll(".suspend-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;
      const suspended = btn.dataset.suspended === "true";
      const confirmText = suspended ? "Unsuspend this user?" : "Suspend this user?";

      if (!confirm(confirmText)) return;

      try {
        const res = await fetch(`/admin/suspend/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspend: !suspended })
        });
        const data = await res.json();

        if (data.success) {
          alert(data.message);
          loadUsers(); // Refresh user list
        } else {
          alert("Error: " + data.message);
        }
      } catch (error) {
        alert("An error occurred while processing your request.");
        console.error("[SUSPEND USER] Error:", error);
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;

      if (!confirm("Delete this user and their data?")) return;

      try {
        const res = await fetch(`/admin/users/${userId}`, { method: "DELETE" });
        const data = await res.json();

        if (data.success) {
          alert("User deleted");
          loadUsers(); // Refresh user list
        } else {
          alert("Error: " + data.message);
        }
      } catch (error) {
        alert("An error occurred while processing your request.");
        console.error("[DELETE USER] Error:", error);
      }
    });
  });
}

// ==============================
// ✅ Filter users by search term
// ==============================
function filterUsers() {
  const term = document.getElementById("userSearch").value.toLowerCase();

  const filtered = allUsers.filter(user =>
    user.name.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term)
  );

  renderUsers(filtered);
}

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

