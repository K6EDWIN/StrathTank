document.addEventListener('DOMContentLoaded', () => {
  fetchCollaborations();

  document.getElementById('collabSearch').addEventListener('input', filterCollaborations);
});

let allCollabs = [];

async function fetchCollaborations() {
  try {
    const res = await fetch('/admin/collaborations');
    const data = await res.json();
    if (!data.success) throw new Error("Failed to fetch");

    allCollabs = data.collaborations;
    renderTable(allCollabs);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

function renderTable(data) {
  const tbody = document.getElementById('collabTableBody');
  tbody.innerHTML = '';

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

function filterCollaborations() {
  const term = document.getElementById('collabSearch').value.toLowerCase();
  const filtered = allCollabs.filter(c =>
    c.project_title.toLowerCase().includes(term) ||
    c.owner_name.toLowerCase().includes(term) ||
    c.collaborator_name.toLowerCase().includes(term)
  );
  renderTable(filtered);
}
