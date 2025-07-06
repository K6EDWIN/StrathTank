// ✅ Initialize all admin data on DOM load
document.addEventListener("DOMContentLoaded", () => {
    loadAdminName();
  loadStats();
  loadUsers();
  loadApprovals();
  loadFlaggedProjects();

  // ✅ Attach logout modal button handlers
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

  if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', logout);
  if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', closeLogoutConfirm);
});

// ==============================
// ✅ Load and display admin statistics
// ==============================
async function loadStats() {
  const container = document.querySelector(".admin-stats");

  try {
    const res = await fetch("/admin/stats");
    const data = await res.json();

    if (!data.success) throw new Error("Failed to fetch stats");

    const { totalUsers, totalProjects, totalCollaborations } = data.stats;

    container.innerHTML = `
      <div class="stat-card">Total Users: <strong>${totalUsers}</strong></div>
      <div class="stat-card">Projects: <strong>${totalProjects}</strong></div>
      <div class="stat-card">Collaborations: <strong>${totalCollaborations}</strong></div>
    `;
  } catch (err) {
    console.error("[LOAD STATS] Error loading stats:", err);
  }
}

// ==============================
// ✅ Load and render users table
// ==============================
function loadUsers() {
  const tbody = document.querySelector(".admin-table tbody");
  tbody.innerHTML = "";

  fetch("/admin/users")
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error("Failed to fetch users");

      data.users.forEach(user => {
        const suspended = user.suspended === 1 || user.suspended === true;
        const row = document.createElement("tr");
      row.innerHTML = `
  <td data-label="Name">${user.name}</td>
  <td data-label="Email">${user.email}</td>
  <td data-label="Role">${user.role}</td>
  <td data-label="Actions">
    <button class="suspend-btn" data-id="${user.id}" data-suspended="${suspended}">
      ${suspended ? 'Unsuspend' : 'Suspend'}
    </button>
    <button class="delete-btn" data-id="${user.id}">Delete</button>
  </td>
`;

        tbody.appendChild(row);
      });

      attachUserActionListeners();
    })
    .catch(err => {
      console.error("[LOAD USERS] Failed to load users:", err);
    });
}

// ==============================
// ✅ Attach suspend and delete action listeners to user buttons
// ==============================
function attachUserActionListeners() {
  // Suspend / Unsuspend user
  document.querySelectorAll(".suspend-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.id;
      const currentlySuspended = btn.dataset.suspended === 'true';
      const confirmMsg = currentlySuspended ? "Unsuspend this user?" : "Suspend this user?";

      if (!confirm(confirmMsg)) return;

      fetch(`/admin/suspend/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspend: !currentlySuspended })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert(data.message);
            loadUsers(); // Refresh list
          } else {
            alert("Error: " + data.message);
          }
        });
    });
  });

  // Delete user
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.id;
      if (!confirm("Are you sure you want to delete this user and all their data?")) return;

      fetch(`/admin/users/${userId}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert("User deleted");
            loadUsers(); // Refresh list
          } else {
            alert("Error: " + data.message);
          }
        });
    });
  });
}

// ==============================
// ✅ Load pending project approvals
// ==============================
async function loadApprovals() {
 const list = document.querySelector(".approval-list");
 list.innerHTML = "";
 try {
  const res = await fetch("/admin/pending-projects");
  const data = await res.json();
  if (!data.success) throw new Error("Failed to fetch approvals");

  data.projects.forEach(project => {
   const card = document.createElement("div");
   card.className = "approval-card";

   const projectType = (project.project_type || '').toLowerCase().trim();
   const viewPage = projectType === 'it' ? 'adminitview' : 'adminnonitview';

   card.innerHTML = `
    <h3>${project.title}</h3>
    <p><strong>Submitted by:</strong> ${project.submittedBy}</p>
    <p>${project.description}</p>
    <div class="approval-actions">
     <button class="view-btn" data-id="${project.id}">👁️ View</button>
     <button class="approve-btn" onclick="approveProject(${project.id})">✅ Approve</button>
     <button class="reject-btn" onclick="rejectProject(${project.id})">❌ Reject</button>
    </div>
   `;

   const viewBtn = card.querySelector(".view-btn");
   viewBtn.addEventListener("click", () => {
    window.location.href = `/${viewPage}?projectId=${project.id}`;
   });

   list.appendChild(card);
  });

 } catch (err) {
  console.error("[LOAD APPROVALS] Error loading approvals:", err);
 }
}


// ==============================
// ✅ Load flagged projects
// ==============================

async function loadFlaggedProjects() {
  const list = document.querySelector(".flagged-list");
  list.innerHTML = "";

  try {
    const res = await fetch("/admin/flagged-projects");
    const data = await res.json();
    if (!data.success) throw new Error("Failed to fetch flagged projects");

    data.flagged.forEach(project => {
      console.log('[Flagged Project]', project);

      const card = document.createElement("div");
      card.className = "flagged-card";

      const projectType = (project.project_type || '').toLowerCase().trim();
      const viewPage = projectType === 'it' ? 'adminitview' : 'adminnonitview';

      card.innerHTML = `
        <h3>${project.name}</h3>
        <p><strong>Flagged by:</strong> ${project.flaggedBy}</p>
        <p>${project.flag_reason}</p>
        <div class="flagged-actions">
          <button class="review-btn">👁️ Review</button>
          <button class="dismiss-btn">🗑️ Dismiss</button>
        </div>
      `;

      // 👁️ REVIEW: Redirect to correct project view
     // 👁️ REVIEW: Redirect to correct project view
const reviewBtn = card.querySelector(".review-btn");
console.log("🚨 Review Button Project ID:", project.project_id, project.id);

// Fix: Safely determine projectId
const projectId = project.project_id || project.id;

reviewBtn.addEventListener("click", () => {
  if (!projectId) {
    alert("⚠️ Cannot open project: ID is missing");
    return;
  }
  window.location.href = `/${viewPage}?projectId=${projectId}`;
});


      // 🗑️ DISMISS: Remove card from DOM
      const dismissBtn = card.querySelector(".dismiss-btn");
      dismissBtn.addEventListener("click", () => {
        list.removeChild(card);
      });

      list.appendChild(card);
    });

  } catch (err) {
    console.error("[LOAD FLAGGED] Error loading flagged projects:", err);
  }
}


// ==============================
// ✅ Approve a project
// ==============================
async function approveProject(projectId) {
  try {
    const res = await fetch(`/admin/approve/${projectId}`, { method: "POST" });
    const data = await res.json();

    if (data.success) {
      alert("✅ Project approved");
      loadApprovals();
    } else {
      alert("❌ Approval failed");
    }
  } catch (err) {
    console.error("[APPROVE PROJECT] Error:", err);
  }
}

// ==============================
// ✅ Reject a project
// ==============================
async function rejectProject(projectId) {
  try {
    const res = await fetch(`/admin/reject/${projectId}`, { method: "POST" });
    const data = await res.json();

    if (data.success) {
      alert("⚠️ Project rejected");
      loadApprovals();
    } else {
      alert("❌ Rejection failed");
    }
  } catch (err) {
    console.error("[REJECT PROJECT] Error:", err);
  }
}

// ==============================
// ✅ Smooth scroll to users section
// ==============================
document.getElementById("users-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector(".admin-main").scrollIntoView({ behavior: "smooth" });
  loadUsers(); // Reload users table
});

// ==============================
// ✅ Logout Modal + Spinner logic (shared)
// ==============================

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

// ✅ Triggered when user confirms logout
function logout() {
  // Close the confirmation modal first
  closeLogoutConfirm();

  // Wait a tiny bit to avoid overlapping modals
  setTimeout(() => {
    showLogoutLoader();

    fetch('/user/logout', {
      method: 'GET',
      credentials: 'include'
    })
    .then(res => {
      // Optional delay to make sure spinner is visible before redirect
      setTimeout(() => {
        if (res.redirected) {
          window.location.href = res.url;
        } else {
          hideLogoutLoader();
          alert('Logout failed.');
        }
      }, 300); // enough time to see spinner
    })
    .catch(err => {
      hideLogoutLoader();
      console.error('Logout error:', err);
      alert('An error occurred during logout.');
    });
  }, 200); // delay allows modal close animation to finish
}




document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebar = document.querySelector('.admin-sidebar');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');

  // Toggle sidebar open on hamburger click
  hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close sidebar on X button click
  closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
});

async function loadAdminName() {
  try {
    const res = await fetch('/admin/profile/info');
    const data = await res.json();

    if (!data.success) throw new Error('Failed to fetch admin');

    const name = data.user.name || 'Admin';
    document.getElementById('adminWelcome').textContent = `Welcome, ${name}`;
  } catch (err) {
    console.error('[LOAD ADMIN NAME]', err);
  }
}
