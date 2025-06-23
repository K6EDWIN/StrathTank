document.addEventListener('DOMContentLoaded', async () => {
  const profilePic = document.getElementById('profilePic');
  const profilePicInput = document.getElementById('profilePicInput');
  const editIcon = document.getElementById('editIcon');

  const usernameEl = document.getElementById('username');
  const emailEl = document.getElementById('email');
  const bioEl = document.getElementById('bio');
  const bioTextarea = document.getElementById('bioTextarea');
  const saveBioBtn = document.getElementById('saveBioBtn');
  const openBioModal = document.getElementById('openBioModal');
  const closeBioModal = document.getElementById('closeBioModal');
  const bioModal = document.getElementById('bioModal');

  const skillsList = document.getElementById('skillsList');
  const addSkillBtn = document.getElementById('addSkillBtn');
  const newSkillInput = document.getElementById('newSkillInput');

  const ownedProjectsEl = document.getElementById('ownedProjects');
  const collaborationsEl = document.getElementById('collaborations');
  const projectsCountEl = document.getElementById('projectsCreated');
  const collabsCountEl = document.getElementById('collaborationsCount');
  const totalLikesEl = document.getElementById('totalLikes');

  let userId = null;

  try {
    const userRes = await fetch('/user', { credentials: 'include' });
    if (!userRes.ok) throw new Error('User not logged in');
    const { user } = await userRes.json();
    userId = user.id;

    usernameEl.textContent = user.name;
    emailEl.textContent = user.email;
    emailEl.style.display = 'block';

    const profileData = await fetch(`/api/profile/${userId}`, { credentials: 'include' });
    const profile = await profileData.json();

    bioEl.textContent = profile.bio || 'No bio yet.';
    bioTextarea.value = profile.bio || '';

    let imagePath = profile.profile_image || '/assets/noprofile.jpg';
    imagePath = imagePath.replace(/\\/g, '/').replace(/\s+/g, ' ').trim();
    imagePath = imagePath.replace('/ ', '/');
    if (imagePath.startsWith('/')) imagePath = imagePath.slice(1);
    profilePic.src = `/${imagePath}`;

    renderSkills(profile.skills || []);

    const statsRes = await fetch(`/api/profile/${userId}/stats`, { credentials: 'include' });
    const stats = await statsRes.json();
    projectsCountEl.textContent = stats.projects || 0;
    collabsCountEl.textContent = stats.collaborations || 0;
    totalLikesEl.textContent = stats.likes || 0;

    const ownRes = await fetch(`/api/projects/by-user/${userId}`, { credentials: 'include' });
    const owned = await ownRes.json();
    owned.forEach(project => ownedProjectsEl.appendChild(renderProjectCard(project)));

    const collabRes = await fetch(`/api/projects/collaborated/${userId}`, { credentials: 'include' });
    const collabs = await collabRes.json();
    collabs.forEach(project => collaborationsEl.appendChild(renderCollabCard(project)));
  } catch (err) {
    console.error('Profile load error:', err);
    window.location.href = '/login';
  }

  // Bio Modal Logic
  openBioModal.addEventListener('click', () => {
    bioModal.style.display = 'flex';
    bioTextarea.value = bioEl.textContent.trim() === 'No bio yet.' ? '' : bioEl.textContent.trim();
  });

  closeBioModal.addEventListener('click', () => {
    bioModal.style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === bioModal) {
      bioModal.style.display = 'none';
    }
  });

  saveBioBtn.addEventListener('click', async () => {
    const newBio = bioTextarea.value.trim();
    const res = await fetch(`/user/bio`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: newBio })
    });
    if (res.ok) {
      bioEl.textContent = newBio || 'No bio yet.';
      bioModal.style.display = 'none';
      alert('Bio updated successfully');
    } else {
      const errData = await res.json();
      alert('Failed to update bio: ' + (errData.message || 'Unknown error'));
    }
  });

  addSkillBtn.addEventListener('click', async () => {
    const input = newSkillInput.value.trim();
    if (!input) return;
    const newSkills = input.split(',').map(s => s.trim()).filter(Boolean);
    const existingSkills = Array.from(skillsList.querySelectorAll('span.skill-name')).map(s => s.textContent.trim());
    const uniqueSkills = [...new Set([...existingSkills, ...newSkills])];
    newSkillInput.value = '';
    await updateSkills(uniqueSkills);
  });

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
      alert('Could not save skills. Please try again.');
    }
  }

  function renderSkills(skills) {
    skillsList.innerHTML = '';
    skills.forEach(skill => {
      const span = document.createElement('span');
      span.classList.add('skill-item');
      span.style.marginRight = '10px';

      const skillName = document.createElement('span');
      skillName.className = 'skill-name';
      skillName.textContent = skill;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '❌';
      removeBtn.title = 'Remove skill';
      removeBtn.style.marginLeft = '2px';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.border = 'none';
      removeBtn.style.background = 'transparent';

      removeBtn.addEventListener('click', async () => {
        const filtered = Array.from(skillsList.querySelectorAll('span.skill-name'))
          .map(el => el.textContent.trim())
          .filter(name => name !== skill);
        await updateSkills(filtered);
      });

      span.appendChild(skillName);
      span.appendChild(removeBtn);
      skillsList.appendChild(span);
    });
  }

  // Profile Picture Upload Logic
  profilePic.addEventListener('mouseenter', () => {
    editIcon.style.display = 'block';
  });

  profilePic.addEventListener('mouseleave', () => {
    editIcon.style.display = 'none';
  });

  editIcon.addEventListener('mouseenter', () => {
    editIcon.style.display = 'block';
  });

  editIcon.addEventListener('mouseleave', () => {
    editIcon.style.display = 'none';
  });

  profilePicInput.addEventListener('change', async (e) => {
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
      if (res.ok && result.success) {
        profilePic.src = `/${result.imagePath}?t=${Date.now()}`;
        alert('Profile picture updated!');
      } else {
        alert(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload profile picture.');
    }
  });
});

// View project button logic
document.body.addEventListener('click', async (e) => {
  if (e.target.classList.contains('view-project-btn')) {
    const projectId = e.target.getAttribute('data-id');
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

function renderProjectCard(project) {
  const div = document.createElement('div');
  div.className = 'project';
  div.innerHTML = `
    <h3>${project.title}</h3>
    <p>${project.description.slice(0, 100)}...</p>
    <span>${project.category}</span><br/>
    <button class="view-project-btn" data-id="${project.id}">View</button>
  `;
  return div;
}

function renderCollabCard(project) {
  const div = document.createElement('div');
  div.className = 'collaboration';
  div.innerHTML = `
    <h3>${project.title}</h3>
    <p>${project.description.slice(0, 100)}...</p>
    <button class="view-project-btn" data-id="${project.id}">View</button>
  `;
  return div;
}
