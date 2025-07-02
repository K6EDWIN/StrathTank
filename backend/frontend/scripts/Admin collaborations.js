// ✅ Wait for DOM content to load and initialize collaborations list & search filter
document.addEventListener('DOMContentLoaded', () => {
  fetchCollaborations();

  // ✅ Attach input event listener for live collaboration filtering
  document.getElementById('collabSearch').addEventListener('input', filterCollaborations);
});

let allCollabs = [];

// ==============================
// ✅ Fetch all collaborations from the server
// ==============================
async function fetchCollaborations() {
  try {
    const res = await fetch('/admin/collaborations');
    const data = await res.json();

    if (!data.success) throw new Error("Failed to fetch collaborations");

    allCollabs = data.collaborations;
    renderTable(allCollabs);
  } catch (err) {
    console.error("[FETCH COLLABORATIONS] Error:", err);
  }
}

// ==============================
// ✅ Render collaboration data into the table body
// ==============================
function renderTable(data) {
  const tbody = document.getElementById('collabTableBody');
  tbody.innerHTML = ''; // Clear existing rows

  data.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.project_title}</strong><br>${item.project_description.slice(0, 60)}...</td>
      <td>${item.owner_name}<br><small>${item.owner_email}</small></td>
      <td>${item.collaborator_name}<br><small>${item.collaborator_email}</small></td>
      <td>${item.status}</td>
      <td>${new Date(item.requested_at).toLocaleString()}</td>
    `;
    tbody.appendChild(row);
  });
}

// ==============================
// ✅ Filter collaborations by search term and re-render table
// ==============================
function filterCollaborations() {
  const term = document.getElementById('collabSearch').value.toLowerCase();

  const filtered = allCollabs.filter(c =>
    c.project_title.toLowerCase().includes(term) ||
    c.owner_name.toLowerCase().includes(term) ||
    c.collaborator_name.toLowerCase().includes(term)
  );

  renderTable(filtered);
}
