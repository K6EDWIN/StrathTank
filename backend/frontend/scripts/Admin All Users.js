// ✅ Wait for DOM content to load and initialize user list & search filter
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();

  // ✅ Attach input event listener for live user filtering
  document.getElementById("userSearch").addEventListener("input", filterUsers);
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
// ✅ Attach event listeners to action buttons (Suspend, Delete)
// ==============================
function attachActionListeners() {
  // Suspend/Unsuspend button
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

  // Delete button
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
// ✅ Filter users by search term and re-render list
// ==============================
function filterUsers() {
  const term = document.getElementById("userSearch").value.toLowerCase();

  const filtered = allUsers.filter(user =>
    user.name.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term)
  );

  renderUsers(filtered);
}
