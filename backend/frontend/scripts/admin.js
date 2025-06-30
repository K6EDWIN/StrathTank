document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadUsers();
  loadApprovals();
  loadFlaggedProjects();
});

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
    console.error("Error loading stats:", err);
  }
}

function loadUsers() {
  const tbody = document.querySelector(".admin-table tbody");
  tbody.innerHTML = "";

  fetch("/admin/users")
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error("Failed to fetch users");

      data.users.forEach(user => {
        const row = document.createElement("tr");
        const suspended = user.suspended === 1 || user.suspended === true;
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
      console.error("Failed to load users:", err);
    });
}

function attachUserActionListeners() {
  document.querySelectorAll(".suspend-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.id;
      const currentlySuspended = btn.dataset.suspended === 'true';

      const confirmMsg = currentlySuspended
        ? "Unsuspend this user?"
        : "Suspend this user?";

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
    console.error("Error loading approvals:", err);
  }
}

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
    console.error("Error loading flagged projects:", err);
  }
}

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
    console.error("Error approving project:", err);
  }
}

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
    console.error("Error rejecting project:", err);
  }
}
document.getElementById("users-link").addEventListener("click", (e) => {
e.preventDefault();
document.querySelector(".admin-main").scrollIntoView({ behavior: "smooth" });
loadUsers(); // This will reload the users table
});



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
        console.error('Logout error:', err);
        alert('Error logging out.');
      });
  }, 1500); // Show loader before logging out
}

