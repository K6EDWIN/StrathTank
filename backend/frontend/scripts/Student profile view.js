// Get userId from query params
const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");
console.log("🧪 userId from URL:", userId);

if (!userId) {
  alert("No user specified.");
  window.location.href = "/explore-projects";
}

const profilePic = document.getElementById("profilePic");
const usernameEl = document.getElementById("username");
const bioEl = document.getElementById("bio");
const skillsList = document.getElementById("skillsList");
const projectsCountEl = document.getElementById("projectsCreated");
const collabsCountEl = document.getElementById("collaborationsCount");
const totalLikesEl = document.getElementById("totalLikes");
const ownedProjectsEl = document.getElementById("ownedProjects");
const collaborationsEl = document.getElementById("collaborations");
const projectsHeader = document.getElementById("projectsHeader");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const userRes = await fetch(`/api/profile/${userId}`);
    if (!userRes.ok) throw new Error("User not found");
    const user = await userRes.json();

    usernameEl.textContent = user.name || "Unknown User";
    bioEl.textContent = user.bio || "No bio yet.";
    projectsHeader.textContent = `${user.name}'s Projects`;

    let imagePath = user.profile_image || "/assets/noprofile.jpg";
    imagePath = imagePath.replace(/\\/g, "/").replace(/\s+/g, " ").trim();
    if (imagePath.startsWith("/")) imagePath = imagePath.slice(1);
    profilePic.src = `/${imagePath}`;

    renderSkills(user.skills || []);

    const statsRes = await fetch(`/api/profile/${userId}/stats`);
    const stats = await statsRes.json();
    projectsCountEl.textContent = stats.projects || 0;
    collabsCountEl.textContent = stats.collaborations || 0;
    totalLikesEl.textContent = stats.likes || 0;

    const ownRes = await fetch(`/api/projects/by-user/${userId}`);
    const owned = await ownRes.json();
    if (owned.length > 0) {
      owned.forEach(project => ownedProjectsEl.appendChild(renderProjectCard(project)));
    }

    const collabRes = await fetch(`/api/projects/collaborated/${userId}`);
    const collabs = await collabRes.json();
    if (collabs.length > 0) {
      collabs.forEach(project => collaborationsEl.appendChild(renderCollabCard(project)));
    }

    // If no owned and no collaborated projects
    if (owned.length === 0 && collabs.length === 0) {
      const noProjectsMsg = document.createElement("p");
      noProjectsMsg.textContent = "No projects added.";
      noProjectsMsg.classList.add("no-projects-msg");

      ownedProjectsEl.appendChild(noProjectsMsg);
      collaborationsEl.appendChild(noProjectsMsg.cloneNode(true));
    }

  } catch (err) {
    console.error("Profile load error:", err);
    alert("Could not load profile.");
    window.location.href = "/explore-projects";
  }
});

function renderSkills(skills) {
  skillsList.innerHTML = "";

  if (!skills || skills.length === 0) {
    const noSkillMsg = document.createElement("p");
    noSkillMsg.textContent = "No skills added.";
    noSkillMsg.classList.add("no-skills-msg");
    skillsList.appendChild(noSkillMsg);
    return;
  }

  skills.forEach(skill => {
    const span = document.createElement("span");
    span.classList.add("skill-item");
    span.textContent = skill;
    skillsList.appendChild(span);
  });
}

function renderProjectCard(project) {
  const description = project.description ? project.description.slice(0, 100) + "..." : "No description available.";
  const div = document.createElement("div");
  div.className = "project";
  div.innerHTML = `
    <h3>${project.title}</h3>
    <p>${description}</p>
    <span>${project.category || 'Uncategorized'}</span><br/>
    <button class="view-project-btn" data-id="${project.id}">View</button>
  `;
  return div;
}

function renderCollabCard(project) {
  const div = document.createElement("div");
  div.className = "collaboration";
  div.innerHTML = `
    <h3>${project.title}</h3>
    <p>${project.description.slice(0, 100)}...</p>
    <button class="view-project-btn" data-id="${project.id}">View</button>
  `;
  return div;
}

document.body.addEventListener("click", async (e) => {
  if (e.target.classList.contains("view-project-btn")) {
    const projectId = e.target.getAttribute("data-id");
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/details`);
      if (!res.ok) throw new Error("Project not found");
      const project = await res.json();
      const type = (project.project_type || '').toLowerCase().trim();
      const page = type === 'it' ? 'project-view' : 'individualProjectsViewnonIT';
      window.location.href = `/${page}?projectId=${projectId}`;
    } catch (err) {
      console.error("❌ Failed to load project:", err.message);
      alert("Could not open project.");
    }
  }
});

// =====================================================
// ✅ Logout Flow with Spinner
// =====================================================
const logoutBtn = document.getElementById('logoutBtn');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', openLogoutConfirm);
  }

  if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener('click', closeLogoutConfirm);
  }

  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', logout);

  }
  
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
