// ==========================
// STATE
// ==========================
let userId = null;

// ==========================
// DOM READY
// ==========================
document.addEventListener('DOMContentLoaded', initProfilePage);

async function initProfilePage() {
  const loader = document.getElementById('profileLoader');
  loader.style.display = 'flex';

  try {
    await loadUserData();
    await loadProfileData();
    await loadStats();
    await loadProjects();
    await loadCollaborations();
  } catch (err) {
    console.error('❌ Profile load error:', err);
    window.location.href = '/login';
  } finally {
    loader.style.display = 'none';
  }

  setupBioModal();
  setupSkillInput();
  setupProfilePictureHover();
  setupProfilePictureUpload();

  document.getElementById('logoutBtn')?.addEventListener('click', openLogoutConfirm);
  document.getElementById('confirmLogoutBtn')?.addEventListener('click', logout);
  document.getElementById('cancelLogoutBtn')?.addEventListener('click', closeLogoutConfirm);
}


// ==========================
// LOAD USER DATA
// ==========================
async function loadUserData() {
  const res = await fetch('/user', { credentials: 'include' });
  if (!res.ok) throw new Error('User not logged in');
  const { user } = await res.json();
  userId = user.id;

  document.getElementById('username').textContent = user.name;
  const emailEl = document.getElementById('email');
  emailEl.textContent = user.email;
  emailEl.style.display = 'block';
}

// ==========================
// LOAD PROFILE DATA
// ==========================
async function loadProfileData() {
  const res = await fetch(`/api/profile/${userId}`, { credentials: 'include' });
  const profile = await res.json();

  document.getElementById('bio').textContent = profile.bio || 'No bio yet.';
  document.getElementById('bioTextarea').value = profile.bio || '';

  const profilePic = document.getElementById('profilePic');
  let imagePath = normalizeImagePath(profile.profile_image || '/assets/noprofile.jpg');
  profilePic.src = imagePath;

  renderSkills(profile.skills || []);
}

// ==========================
// LOAD STATS
// ==========================
async function loadStats() {
  const res = await fetch(`/api/profile/${userId}/stats`, { credentials: 'include' });
  const stats = await res.json();

  document.getElementById('projectsCreated').textContent = stats.projects ?? 0;
  document.getElementById('collaborationsCount').textContent = stats.collaborations ?? 0;
  document.getElementById('totalLikes').textContent = stats.likes ?? 0;
}

// ==========================
// LOAD OWNED PROJECTS
// ==========================
async function loadProjects() {
  const res = await fetch(`/api/projects/by-user/${userId}`, { credentials: 'include' });
  const projects = await res.json();

  const ownedProjectsEl = document.getElementById('ownedProjects');
  ownedProjectsEl.innerHTML = '';

  if (!projects.length) {
    ownedProjectsEl.innerHTML = '<p class="no-projects-msg">No projects created yet.</p>';
    return;
  }

  projects.forEach(project => {
    ownedProjectsEl.appendChild(renderProjectCard(project));
  });
}

// ==========================
// LOAD COLLABORATIONS
// ==========================
async function loadCollaborations() {
  const res = await fetch(`/api/projects/collaborated/${userId}`, { credentials: 'include' });
  const projects = await res.json();

  const collaborationsEl = document.getElementById('collaborations');
  collaborationsEl.innerHTML = '';

  if (!projects.length) {
    collaborationsEl.innerHTML = '<p class="no-collabs-msg">Not collaborating on any projects yet.</p>';
    return;
  }

  projects.forEach(project => {
    collaborationsEl.appendChild(renderCollabCard(project));
  });
}

// ==========================
// BIO MODAL
// ==========================
function setupBioModal() {
  const bioModal = document.getElementById('bioModal');
  const bioTextarea = document.getElementById('bioTextarea');
  const bioEl = document.getElementById('bio');
  const saveBioBtn = document.getElementById('saveBioBtn');

  document.getElementById('openBioModal')?.addEventListener('click', () => {
    bioModal.style.display = 'flex';
    bioTextarea.value = bioEl.textContent.trim() === 'No bio yet.' ? '' : bioEl.textContent.trim();
  });

  document.getElementById('closeBioModal')?.addEventListener('click', () => {
    bioModal.style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === bioModal) bioModal.style.display = 'none';
  });

  saveBioBtn?.addEventListener('click', async () => {
    const newBio = bioTextarea.value.trim();
    const bioLoader = document.getElementById('bioUpdateLoader');
    const bioMessage = document.getElementById('bioUpdateMessage');

    // Show loader with "Updating..." text
    bioMessage.textContent = 'Updating bio...';
    bioLoader.style.display = 'flex';

    try {
      const res = await fetch(`/user/bio`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: newBio })
      });

      if (!res.ok) throw new Error('Failed to update bio');

      bioEl.textContent = newBio || 'No bio yet.';
      bioMessage.textContent = '✅ Bio updated!';

      setTimeout(() => {
        bioLoader.style.display = 'none';
        bioModal.style.display = 'none';
      }, 1500);
    } catch (err) {
      console.error('Bio update error:', err);
      bioMessage.textContent = '❌ Failed to update bio.';
      setTimeout(() => {
        bioLoader.style.display = 'none';
      }, 2000);
    }
  });
}


// ==========================
// SKILL MANAGEMENT
// ==========================
function setupSkillInput() {
  const addSkillBtn = document.getElementById('addSkillBtn');
  const newSkillInput = document.getElementById('newSkillInput');
  const skillOverlay = document.getElementById('skillUpdateOverlay');
  const skillMessage = skillOverlay.querySelector('p');

  addSkillBtn?.addEventListener('click', async () => {
    const input = newSkillInput.value.trim();
    if (!input) return;

    const newSkills = input.split(',').map(s => s.trim()).filter(Boolean);
    const existingSkills = Array.from(document.querySelectorAll('#skillsList .skill-name')).map(s => s.textContent.trim());
    const uniqueSkills = [...new Set([...existingSkills, ...newSkills])];

    newSkillInput.value = '';

    skillMessage.textContent = 'Updating skill...';
    skillOverlay.style.display = 'flex';

    try {
      await updateSkills(uniqueSkills);
      skillMessage.textContent = '✅ Skill updated!';
    } catch (err) {
      console.error('Skill update error:', err);
      skillMessage.textContent = '❌ Failed to update skills.';
    } finally {
      setTimeout(() => {
        skillOverlay.style.display = 'none';
      }, 1500);
    }
  });
}

async function updateSkills(skills) {
  renderSkills(skills);
  try {
    const res = await fetch(`/user/skills`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills })
    });
    if (!res.ok) throw new Error('Failed to save skills');
  } catch (err) {
    console.error('Skill update error:', err);
    alert('❌ Could not save skills.');
  }
}

function renderSkills(skills) {
  const skillsList = document.getElementById('skillsList');
  skillsList.innerHTML = '';

  skills.forEach(skill => {
    const span = document.createElement('span');
    span.className = 'skill-item';

    const skillName = document.createElement('span');
    skillName.className = 'skill-name';
    skillName.textContent = skill;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '❌';
    removeBtn.title = 'Remove skill';
    removeBtn.className = 'remove-skill';
    removeBtn.addEventListener('click', async () => {
      const filtered = skills.filter(s => s !== skill);
      await updateSkills(filtered);
    });

    span.appendChild(skillName);
    span.appendChild(removeBtn);
    skillsList.appendChild(span);
  });
}

// ==========================
// PROFILE PICTURE HOVER
// ==========================
function setupProfilePictureHover() {
  const profilePic = document.getElementById('profilePic');
  const editIcon = document.getElementById('editIcon');

  [profilePic, editIcon].forEach(el => {
    el?.addEventListener('mouseenter', () => editIcon.style.display = 'block');
    el?.addEventListener('mouseleave', () => editIcon.style.display = 'none');
  });
}

// ==========================
// PROFILE PICTURE UPLOAD
// ==========================
function setupProfilePictureUpload() {
  document.getElementById('profilePicInput')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const res = await fetch('/user/profile-picture', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const result = await res.json();

      if (!res.ok || !result.success) throw new Error(result.message || 'Upload failed');
      document.getElementById('profilePic').src = `${normalizeImagePath(result.imagePath)}?t=${Date.now()}`;
      alert('✅ Profile picture updated!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ Failed to upload profile picture.');
    }
  });
}

// ==========================
// IMAGE PATH HELPER
// ==========================
function normalizeImagePath(path) {
  path = path.replace(/\\/g, '/').trim();
  if (!path.startsWith('/')) path = '/' + path;
  return path;
}

// ==========================
// RENDER PROJECT CARDS
// ==========================
function renderProjectCard(project) {
  const div = document.createElement('div');
  div.className = 'project';
  div.innerHTML = `
    <h3>${project.title}</h3>
    <p>${project.description ? project.description.slice(0, 100) + '...' : 'No description available.'}</p>
    <span>${project.category || 'Uncategorized'}</span><br/>
    <button class="view-project-btn" data-id="${project.id}">View</button>
  `;
  return div;
}

function renderCollabCard(project) {
  const div = document.createElement('div');
  div.className = 'collaboration';
  div.innerHTML = `
    <h3>${project.title}</h3>
    <p>${project.description ? project.description.slice(0, 100) + '...' : 'No description available.'}</p>
    <button class="view-project-btn" data-id="${project.id}">View</button>
  `;
  return div;
}

// ==========================
// VIEW PROJECT BUTTON
// ==========================
document.body.addEventListener('click', async (e) => {
  if (e.target.classList.contains('view-project-btn')) {
    const projectId = e.target.getAttribute('data-id');
    if (!projectId) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/details`);
      if (!res.ok) throw new Error('Project not found');
      const project = await res.json();

      const type = (project.project_type || '').toLowerCase().trim();
      const page = type === 'it' ? 'project-view' : 'individualProjectsViewnonIT';
      window.location.href = `/${page}?projectId=${projectId}`;
    } catch (err) {
      console.error('❌ Failed to load project:', err);
      alert('❌ Could not open project.');
    }
  }
});
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