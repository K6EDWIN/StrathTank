// ✅ Wait for DOM content to load and initialize collaborations list & search filter
document.addEventListener('DOMContentLoaded', () => {
  fetchCollaborations();

  // ✅ Attach input event listener for live collaboration filtering
  const searchInput = document.getElementById('collabSearch');
  if (searchInput) {
    searchInput.addEventListener('input', filterCollaborations);
  }

  // ✅ Attach logout modal button listeners if present
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

  if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', logout);
  if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', closeLogoutConfirm);
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
  if (!tbody) return;

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

