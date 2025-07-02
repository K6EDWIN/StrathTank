// ✅ Initialize all admin data on DOM load
document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadUsers();
  loadApprovals();
  loadFlaggedProjects();
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
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>
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
            loadUsers(); // Refresh list to reflect status change
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
// ✅ Load pending project approvals and display them
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
      card.innerHTML = `
        <h3>${project.title}</h3>
        <p>Submitted by: ${project.submittedBy}</p>
        <p>${project.description}</p>
        <button class="approve" onclick="approveProject(${project.id})">Approve</button>
        <button class="reject" onclick="rejectProject(${project.id})">Reject</button>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error("[LOAD APPROVALS] Error loading approvals:", err);
  }
}

// ==============================
// ✅ Load flagged projects and display them
// ==============================
async function loadFlaggedProjects() {
  const list = document.querySelector(".flagged-list");
  list.innerHTML = "";

  try {
    const res = await fetch("/admin/flagged-projects");
    const data = await res.json();

    if (!data.success) throw new Error("Failed to fetch flagged projects");

    data.flagged.forEach(project => {
      const card = document.createElement("div");
      card.className = "flagged-card";
      card.innerHTML = `
        <h3>${project.name}</h3>
        <p>Flagged by: ${project.flaggedBy}</p>
        <p>${project.flag_reason}</p>
        <button class="review" onclick="alert('Review ${project.name}')">Review</button>
        <button class="dismiss" onclick="alert('Dismissed ${project.name}')">Dismiss</button>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error("[LOAD FLAGGED] Error loading flagged projects:", err);
  }
}

// ==============================
// ✅ Approve a project by ID
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
    console.error("[APPROVE PROJECT] Error approving project:", err);
  }
}

// ==============================
// ✅ Reject a project by ID
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
    console.error("[REJECT PROJECT] Error rejecting project:", err);
  }
}

// ==============================
// ✅ Smooth scroll to users section and reload user table on link click
// ==============================
document.getElementById("users-link").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector(".admin-main").scrollIntoView({ behavior: "smooth" });
  loadUsers(); // Reload users table
});

// ==============================
// ✅ Logout user with loader and redirect handling
// ==============================
function logoutUser() {
  // Show logout loader
  const loader = document.getElementById('logout-loader');
  loader.style.display = 'flex';

  // Optional delay for UX (e.g. 1.5 seconds)
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
        console.error('[LOGOUT USER] Error:', err);
        alert('Error logging out.');
      });
  }, 1500); // Show loader before logging out
}
