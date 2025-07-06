// ==========================
// DOMContentLoaded
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  loadMentorProfile();
  loadMentorshipStats();
  loadCurrentMentees();

  // Logout modal listeners
  document.getElementById('confirmLogoutBtn')?.addEventListener('click', logout);
  document.getElementById('cancelLogoutBtn')?.addEventListener('click', closeLogoutConfirm);
});

// ==========================
// 1. LOAD MENTOR PROFILE FROM SERVER
// ==========================
async function loadMentorProfile() {
  try {
    const res = await fetch('/user', { credentials: 'include' });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const { user } = await res.json();

    renderMentorProfile(user);
  } catch (err) {
    console.error('❌ Failed to load mentor profile:', err);
    window.location.href = '/login';
  }
}

// ==========================
// 2. RENDER MENTOR PROFILE
// ==========================
function renderMentorProfile(user) {
  renderTextField('mentorName', user.name || 'Unknown');
  renderTextField('mentorEmail', user.email || 'No email available');

  const bioText = user.bio && user.bio.trim() ? user.bio.trim() : 'No bio yet.';
  renderTextField('mentorBio', bioText);

  const profilePic = document.getElementById('mentorProfilePic');
  let imagePath = user.profile_image?.replace(/\\/g, '/').trim() || '/assets/noprofile.jpg';
  if (imagePath && !imagePath.startsWith('/')) imagePath = '/' + imagePath;
  profilePic.src = `${imagePath}?t=${Date.now()}`;

  let skills = [];
  if (user.skills && user.skills.trim()) {
    skills = user.skills.split(',').map(s => s.trim()).filter(Boolean);
  }
  renderSkills(skills);
}

// ==========================
// 3. UTILITY TO FILL TEXT CONTENT
// ==========================
function renderTextField(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ==========================
// 4. RENDER SKILLS LIST
// ==========================
function renderSkills(skills) {
  const skillsContainer = document.getElementById('mentorSkills');
  skillsContainer.innerHTML = '';

  if (!skills.length) {
    skillsContainer.textContent = 'No skills added yet.';
    return;
  }

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
      const newSkills = skills.filter(s => s !== skill);
      await saveSkills(newSkills);
      renderSkills(newSkills);
    });

    span.appendChild(skillName);
    span.appendChild(removeBtn);
    skillsContainer.appendChild(span);
  });
}

// ==========================
// 5. SAVE UPDATED SKILLS TO SERVER
// ==========================
async function saveSkills(skills) {
  try {
    const res = await fetch('/user/skills', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills }),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to save skills');
  } catch (err) {
    console.error(err);
    alert('❌ Failed to save skills.');
  }
}

// ==========================
// 6. BIO MODAL HANDLING
// ==========================
document.getElementById('openBioModal')?.addEventListener('click', () => {
  const bioModal = document.getElementById('bioModal');
  const bioTextarea = document.getElementById('bioTextarea');
  const bioEl = document.getElementById('mentorBio');

  bioModal.style.display = 'flex';
  const currentBio = bioEl.textContent.trim();
  bioTextarea.value = currentBio === 'No bio yet.' ? '' : currentBio;
});

document.getElementById('closeBioModal')?.addEventListener('click', () => {
  document.getElementById('bioModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
  const bioModal = document.getElementById('bioModal');
  if (e.target === bioModal) {
    bioModal.style.display = 'none';
  }
});

document.getElementById('saveBioBtn')?.addEventListener('click', async () => {
  const bioTextarea = document.getElementById('bioTextarea');
  const newBio = bioTextarea.value.trim();
  try {
    const res = await fetch('/user/bio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: newBio }),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to save bio');
    document.getElementById('mentorBio').textContent = newBio || 'No bio yet.';
    document.getElementById('bioModal').style.display = 'none';
    alert('✅ Bio updated!');
  } catch (err) {
    console.error(err);
    alert('❌ Failed to update bio.');
  }
});

// ==========================
// 7. ADD NEW SKILLS
// ==========================
document.getElementById('addSkillBtn')?.addEventListener('click', async () => {
  const newSkillInput = document.getElementById('newSkillInput');
  const input = newSkillInput.value.trim();
  if (!input) return;

  const newSkills = input.split(',').map(s => s.trim()).filter(Boolean);
  const existingSkills = Array.from(document.querySelectorAll('#mentorSkills .skill-name'))
    .map(el => el.textContent.trim());
  const allSkills = [...new Set([...existingSkills, ...newSkills])];

  await saveSkills(allSkills);
  renderSkills(allSkills);
  newSkillInput.value = '';
});

// ==========================
// 8. PROFILE PICTURE UPLOAD
// ==========================
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
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed');

    let newPath = data.imagePath.replace(/\\/g, '/').trim();
    if (newPath && !newPath.startsWith('/')) newPath = '/' + newPath;
    document.getElementById('mentorProfilePic').src = `${newPath}?t=${Date.now()}`;
    alert('✅ Profile picture updated!');
  } catch (err) {
    console.error(err);
    alert('❌ Failed to upload profile picture.');
  }
});

// ==========================
// 9. LOAD MENTORSHIP STATS
// ==========================
async function loadMentorshipStats() {
  try {
    const res = await fetch('/api/mentor/stats', { credentials: 'include' });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();

    if (data.success) {
      document.getElementById('menteesGuided').textContent = data.menteesGuided ?? 0;
      document.getElementById('mentorshipHours').textContent = data.mentorshipHours ?? 0;
      document.getElementById('activeMentorships').textContent = data.activeMentorships ?? 0;
    } else {
      console.warn('⚠️ Stats response not successful:', data);
    }
  } catch (err) {
    console.error('❌ Failed to load mentorship stats:', err);
  }
}

// ==========================
// 10. LOAD CURRENT MENTEES
// ==========================
async function loadCurrentMentees() {
  try {
    const res = await fetch('/api/mentor/current-mentees', { credentials: 'include' });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();

    if (data.success) {
      renderCurrentMentees(data.mentees);
    } else {
      console.warn('⚠️ Mentees response not successful:', data);
    }
  } catch (err) {
    console.error('❌ Failed to load current mentees:', err);
  }
}

// ==========================
// 11. RENDER CURRENT MENTEES
// ==========================
function renderCurrentMentees(mentees) {
  const grid = document.getElementById('menteesGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (!mentees.length) {
    grid.innerHTML = '<p>No current mentees assigned yet.</p>';
    return;
  }

  mentees.forEach(mentee => {
    const card = document.createElement('div');
    card.className = 'mentee-card';

    const img = document.createElement('img');
    let imagePath = mentee.mentee_profile_image?.replace(/\\/g, '/').trim() || '/assets/noprofile.jpg';
    if (imagePath && !imagePath.startsWith('/')) imagePath = '/' + imagePath;
    img.src = `${imagePath}?t=${Date.now()}`;
    img.alt = mentee.mentee_name;
    img.className = 'mentee-profile-pic';

    const name = document.createElement('h3');
    name.textContent = mentee.mentee_name;

    const project = document.createElement('p');
    project.textContent = `Project: ${mentee.project_title}`;

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(project);

    grid.appendChild(card);
  });
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