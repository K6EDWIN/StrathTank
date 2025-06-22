let sessionUserId = window.currentUserId || null;

/* -----------------------------------------------
   Toggle IT Fields
-------------------------------------------------*/
function toggleITFields(checkbox) {
  const itFields = document.getElementById('itFields');
  const nonItFields = document.getElementById('nonItFields');
  itFields.style.display = checkbox.checked ? 'block' : 'none';
  nonItFields.style.display = checkbox.checked ? 'none' : 'block';
}

/* -----------------------------------------------
   Add Team Member Input
-------------------------------------------------*/
function addTeamMemberInput() {
  const container = document.getElementById('teamMembers');

  const wrapper = document.createElement('div');
  wrapper.classList.add('team-member-wrapper');
  Object.assign(wrapper.style, {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    alignItems: 'center',
    marginBottom: '8px',
    position: 'relative'
  });

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type team member name...';
  input.classList.add('team-member-input');
  input.autocomplete = 'off';

  const roleInput = document.createElement('input');
  roleInput.type = 'text';
  roleInput.placeholder = 'Enter role (e.g. UI/UX, Backend)';
  roleInput.classList.add('team-role-input');
  roleInput.style.flex = '1';

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '❌';
  Object.assign(removeBtn.style, {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem'
  });
  removeBtn.title = 'Remove team member';
  removeBtn.type = 'button';
  removeBtn.addEventListener('click', () => wrapper.remove());

  const suggestionBox = document.createElement('div');
  suggestionBox.classList.add('suggestion-list');
  Object.assign(suggestionBox.style, {
    position: 'absolute',
    top: '100%',
    left: '0',
    zIndex: '999',
    background: '#fff',
    width: '100%',
    border: '1px solid #ccc',
    display: 'none',
    maxHeight: '200px',
    overflowY: 'auto'
  });

  let currentTimeout;

  input.addEventListener('input', () => {
    clearTimeout(currentTimeout);
    const query = input.value.trim();

    if (query.length < 2) {
      suggestionBox.style.display = 'none';
      return;
    }

    currentTimeout = setTimeout(() => {
      fetch(`/user/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(users => {
          suggestionBox.innerHTML = '';

          if (!users.length) {
            suggestionBox.innerHTML = `<div style="padding: 0.5rem;">No matches found</div>`;
            suggestionBox.style.display = 'block';
            return;
          }

          users.forEach(user => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item');
            item.innerHTML = `
              <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer;">
                <img src="${user.profile_photo ? user.profile_photo.replace(/\\/g, '/').replace(/\s+/g, '') : '/assets/noprofile.jpg'}" width="32" height="32" style="border-radius: 50%;">
                <span>${user.name} <small style="color: gray;">(${user.role || 'Member'})</small></span>
              </div>`;

            item.addEventListener('click', () => {
              input.value = user.name;
              input.dataset.userId = user.id;
              suggestionBox.style.display = 'none';
            });

            suggestionBox.appendChild(item);
          });

          suggestionBox.style.display = 'block';
        })
        .catch(() => {
          suggestionBox.innerHTML = `<div style="padding: 0.5rem; color: red;">Error fetching users</div>`;
          suggestionBox.style.display = 'block';
        });
    }, 300);
  });

  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) suggestionBox.style.display = 'none';
  });

  wrapper.append(input, roleInput, removeBtn, suggestionBox);
  container.appendChild(wrapper);
}

/* -----------------------------------------------
   Show Thumbs Animation
-------------------------------------------------*/
function showAndHideThumbsGif() {
  const gif = document.getElementById("thumbsGif");
  gif.style.display = "flex";
  gif.style.opacity = "1";
  gif.classList.remove("fade-out");
  setTimeout(() => gif.classList.add("fade-out"), 1000);
  setTimeout(() => gif.style.display = "none", 3000);
}

/* -----------------------------------------------
   Gather Form Data
-------------------------------------------------*/
function gatherFormData() {
  const form = new FormData();

  form.append("user_id", sessionUserId);
  form.append("title", document.getElementById("title").value);
  form.append("Short_description", document.getElementById("shortDesc").value);
  form.append("project_lead", document.getElementById("lead").value);
  form.append("category", document.getElementById("category").value);
  form.append("description", document.getElementById("abstract").value);
  form.append("tags", document.getElementById("tags").value);
  form.append("launch_date", document.getElementById("launchDate").value);
  form.append("status", "pending");
  form.append("version", "1.0");

  const isIT = document.getElementById("isITProject").checked;
  form.append("project_type", isIT ? "it" : "non-it");

  const teamInputs = document.querySelectorAll(".team-member-input");
  form.append("team_size", teamInputs.length);

  teamInputs.forEach(input => {
    const memberId = input.dataset.userId || null;
    const memberName = input.value;
    const roleInput = input.parentElement.querySelector('.team-role-input');
    const role = roleInput?.value || '';

    if (memberId) {
      form.append("team_ids[]", memberId);
    } else {
      form.append("team_names[]", memberName);
    }

    form.append("team_roles[]", role);
  });

  if (isIT) {
    const techDetails = [
      document.querySelector('#itFields input[placeholder*="Programming"]')?.value,
      document.querySelector('#itFields input[placeholder*="Framework"]')?.value,
      document.querySelector('#itFields input[placeholder*="Database"]')?.value,
      document.querySelector('#itFields input[placeholder*="Deployment"]')?.value
    ].filter(Boolean).join(" | ");
    form.append("technical_details", techDetails);

    const repoURL = document.getElementById("repo_url")?.value;
    const stars = document.getElementById("stars")?.value;
    const forks = document.getElementById("forks")?.value;

    if (repoURL?.trim()) {
      console.log("📦 Adding GitHub metadata to form...");
      form.append("repo_url", repoURL.trim());
      form.append("stars", stars || 0);
      form.append("forks", forks || 0);
    } else {
      console.log("⚠️ No GitHub repo URL provided.");
    }
  } else {
    const nonItDetails = [
      document.getElementById("focus")?.value,
      document.getElementById("methodology")?.value,
      document.getElementById("beneficiaries")?.value,
      document.getElementById("goals")?.value
    ].filter(Boolean).join(" | ");
    form.append("technical_details", nonItDetails);
  }

  const profileInput = document.querySelector('input[type="file"][name="project_profile_picture"]');
  if (profileInput?.files[0]) {
    form.append("project_profile_picture", profileInput.files[0]);
  }

  const screenshotsInput = document.querySelector('input[type="file"][name="screenshots[]"]');
  if (screenshotsInput?.files) {
    [...screenshotsInput.files].forEach(file => form.append("screenshots[]", file));
  }

  const docsInput = document.querySelector('input[type="file"][name="documents[]"]');
  if (docsInput?.files) {
    [...docsInput.files].forEach(file => form.append("documents[]", file));
  }

  return form;
}

/* -----------------------------------------------
   Submit Project
-------------------------------------------------*/
async function submitProject(e) {
  e.preventDefault();
  showAndHideThumbsGif();

  const formData = gatherFormData();

  try {
    const res = await fetch("/user/upload-project", {
      method: "POST",
      body: formData
    });

    const result = await res.json();
    if (res.ok && result.success) {
      alert("✅ Project submitted successfully!");
      window.location.href = "/explore-projects";
    } else {
      alert("❌ Upload failed: " + (result.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error submitting project:", err);
    alert("❌ Upload failed due to network error.");
  }
}

/* -----------------------------------------------
   DOM Ready
-------------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  sessionUserId = window.currentUserId || null;

  addTeamMemberInput();

  document.querySelector(".submit")?.addEventListener("click", submitProject);
  document.querySelector(".draft")?.addEventListener("click", e => {
    e.preventDefault();
    alert("📝 Draft saving is not yet implemented.");
  });

  document.getElementById('selectRepoBtn').addEventListener('click', async () => {
    const input = document.getElementById('repo_url');
    let url = prompt('Paste your GitHub repo URL:', input.value || 'https://github.com/');

    if (!url || !url.includes('github.com')) {
      alert('❌ Invalid GitHub URL.');
      return;
    }

    const parts = url.replace('https://github.com/', '').split('/');
    if (parts.length < 2) {
      alert('❌ Please provide a full GitHub repo URL like https://github.com/user/repo');
      return;
    }

    const [owner, repo] = parts;

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      input.value = data.html_url;

      const formEl = document.querySelector('form');

      let starsInput = document.getElementById('stars');
      if (!starsInput) {
        starsInput = document.createElement('input');
        starsInput.type = 'hidden';
        starsInput.name = 'stars';
        starsInput.id = 'stars';
        formEl.appendChild(starsInput);
      }
      starsInput.value = data.stargazers_count || 0;

      let forksInput = document.getElementById('forks');
      if (!forksInput) {
        forksInput = document.createElement('input');
        forksInput.type = 'hidden';
        forksInput.name = 'forks';
        forksInput.id = 'forks';
        formEl.appendChild(forksInput);
      }
      forksInput.value = data.forks_count || 0;

      alert(`✅ Repository "${data.full_name}" found and set.`);
    } catch (e) {
      alert('❌ No repo exists in this URL.');
      input.value = '';
    }
  });
});
