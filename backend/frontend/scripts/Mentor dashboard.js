// ==========================
// DOMContentLoaded: Initialize dashboard and request pool
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  await loadDashboard();
  await loadRequestPool(); // Preload request pool for quick access
});

// ==========================
// Load Mentor Dashboard Data
// ==========================
async function loadDashboard() {
  try {
    const res = await fetch("/api/mentor/dashboard", { credentials: "include" });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        alert("Access denied. Please log in with a mentor account.");
      } else {
        alert(`Server error (${res.status}). Please try again later.`);
      }
      return;
    }

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Failed to load dashboard data.");
      return;
    }

    const { mentor, assignedProjects, allProjects } = data;

    // Display mentor's name
    document.getElementById("username").textContent = mentor.name;

    // Render projects
    renderProjects(assignedProjects, document.getElementById("assignedProjects"), true);
    renderProjects(allProjects, document.getElementById("allProjects"));

  } catch (err) {
    console.error("❌ Error loading mentor dashboard:", err);
    alert("Unexpected error while loading your dashboard. Check your connection.");
  }
}

// ==========================
// Render Projects into Container
// ==========================
function renderProjects(projects, container, isAssigned = false) {
  container.innerHTML = "";

  if (!projects || projects.length === 0) {
    if (isAssigned) {
      // Show request pool button if no assigned projects
      container.innerHTML = `
        <div class="empty-message">
          <p>No projects have been assigned to you yet.</p>
          <button id="openRequestPoolBtn" class="open-pool-btn">View the request pool of unassigned projects</button>
        </div>
      `;
      document.getElementById("openRequestPoolBtn").addEventListener("click", openRequestPoolModal);
    } else {
      container.innerHTML = "<p>No projects found.</p>";
    }
    return;
  }

  projects.forEach(project => {
    const card = createProjectCard(project);
    container.appendChild(card);
  });
}

// ==========================
// Create Single Project Card Element
// ==========================
function createProjectCard(project) {
  const card = document.createElement("div");
  card.className = "card";

  const imageUrl = project.image || '/assets/noprofile.jpg';
  const description = project.short_description || project.description || 'No description provided.';
  const dateStr = project.created_at ? new Date(project.created_at).toLocaleDateString() : '';

  card.innerHTML = `
    <img src="${imageUrl}" alt="Project Image" />
    <h3>${project.title}</h3>
    <p>${description}</p>
    <div class="meta">
      ${project.category || 'Uncategorized'} | ${dateStr}
    </div>
    <div class="interactions">
      <span>❤️ ${project.likes ?? 0}</span>
      <span>💬 ${project.comments ?? 0}</span>
    </div>
  `;

  return card;
}

// ==========================
// Request Pool Modal Logic
// ==========================
let requestPoolData = [];

async function loadRequestPool() {
  try {
    const res = await fetch('/api/mentor/request-pool', { credentials: 'include' });
    if (!res.ok) throw new Error(`Server error ${res.status}`);

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to load request pool");

    requestPoolData = data.pool;
  } catch (err) {
    console.error("❌ Error loading request pool:", err);
    requestPoolData = [];
  }
}

function openRequestPoolModal() {
  const modal = document.getElementById("requestPoolModal");
  const container = document.getElementById("requestPoolContent");
  container.innerHTML = "";

  if (!requestPoolData || requestPoolData.length === 0) {
    container.innerHTML = `<p>No unassigned mentorship requests at the moment.</p>`;
  } else {
    requestPoolData.forEach(item => {
      const card = createRequestPoolCard(item);
      container.appendChild(card);
    });
  }

  modal.style.display = "block";
}

function closeRequestPoolModal() {
  document.getElementById("requestPoolModal").style.display = "none";
}

// ==========================
// Create Request Pool Card Element
// ==========================
function createRequestPoolCard(item) {
  const card = document.createElement("div");
  card.className = "card request-pool-card";

  const imageUrl = item.image || '/assets/noprofile.jpg';
  const description = item.short_description || 'No description provided.';
  const projectDate = item.project_created_at ? new Date(item.project_created_at).toLocaleDateString() : '';
  const requestDate = item.request_created_at ? new Date(item.request_created_at).toLocaleDateString() : '';

  card.innerHTML = `
    <img src="${imageUrl}" alt="Project Image" />
    <h3>${item.title}</h3>
    <p>${description}</p>
    <div class="meta">
      Project Created: ${projectDate}<br/>
      Category: ${item.category || 'Uncategorized'}
    </div>
    <div class="request-meta">
      <strong>Subject:</strong> ${item.subject}<br/>
      <strong>Challenge:</strong> ${item.challenge}<br/>
      <em>Requested on: ${requestDate}</em>
    </div>
    <div class="modal-actions">
      <a class="view-btn" href="/project/${item.project_id}" target="_blank">View Project</a>
      <button class="assign-btn" data-id="${item.mentorship_request_id}">Assign Yourself</button>
    </div>
  `;

  // Assignment button event listener
  card.querySelector('.assign-btn').addEventListener('click', () => assignYourselfToRequest(item.mentorship_request_id));

  return card;
}

// ==========================
// Assign Mentor to Request
// ==========================
async function assignYourselfToRequest(requestId) {
  if (!confirm("Are you sure you want to assign yourself to this request?")) return;

  try {
    const res = await fetch('/api/mentor/respond', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action: 'accepted' })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Assignment failed");

    alert("Successfully assigned!");
    closeRequestPoolModal();
    await loadDashboard();   // Refresh dashboard to show new assignment
    await loadRequestPool(); // Refresh pool data
  } catch (err) {
    console.error("❌ Error assigning to request:", err);
    alert("Failed to assign yourself. Please try again.");
  }
}

// ==========================
// Modal Close Handling
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("closeRequestPoolModal").addEventListener("click", closeRequestPoolModal);
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("requestPoolModal");
    if (event.target == modal) {
      closeRequestPoolModal();
    }
  });
});

// Make sure openRequestPoolBtn listener exists (may be dynamically created)
document.getElementById("openRequestPoolBtn")?.addEventListener("click", openRequestPoolModal);

// ==========================
// Logout User Function
// ==========================
function logoutUser() {
  const loader = document.getElementById('logout-loader');
  loader.style.display = 'flex';

  setTimeout(() => {
    fetch('/user/logout', {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => {
        if (res.redirected) {
          window.location.href = res.url;
        } else {
          loader.style.display = 'none';
          alert('Logout failed.');
        }
      })
      .catch(err => {
        loader.style.display = 'none';
        console.error('Logout error:', err);
        alert('Error logging out.');
      });
  }, 1500);
}
