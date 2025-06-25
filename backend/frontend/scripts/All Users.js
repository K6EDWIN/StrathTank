document.addEventListener("DOMContentLoaded", () => {
  loadUsers();

  // Filter users as you type
  document.getElementById("userSearch").addEventListener("input", filterUsers);
});

let allUsers = [];

async function loadUsers() {
  try {
    const res = await fetch("/admin/allusers");
    const data = await res.json();
    if (!data.success) throw new Error("Failed to load users");

    allUsers = data.users;
    renderUsers(allUsers);
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

function renderUsers(users) {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");
    const suspended = user.suspended === 1 || user.suspended === true;

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

function attachActionListeners() {
  document.querySelectorAll(".suspend-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;
      const suspended = btn.dataset.suspended === "true";
      const confirmText = suspended ? "Unsuspend this user?" : "Suspend this user?";
      if (!confirm(confirmText)) return;

      const res = await fetch(`/admin/suspend/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspend: !suspended })
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadUsers(); // refresh
      } else {
        alert("Error: " + data.message);
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;
      if (!confirm("Delete this user and their data?")) return;

      const res = await fetch(`/admin/users/${userId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (data.success) {
        alert("User deleted");
        loadUsers(); // refresh
      } else {
        alert("Error: " + data.message);
      }
    });
  });
}

function filterUsers() {
  const term = document.getElementById("userSearch").value.toLowerCase();
  const filtered = allUsers.filter(user =>
    user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
  );
  renderUsers(filtered);
}
