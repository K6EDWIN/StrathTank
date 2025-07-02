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
              <img src="${user.profile_photo ? encodeURI(user.profile_photo.replace(/\\/g, '/')) : '/assets/noprofile.jpg'}" width="32" height="32" style="border-radius: 50%;">
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
   Session Fetch
-------------------------------------------------*/
let sessionUserId = null;

async function fetchSessionUserId() {
  try {
    const res = await fetch('/user', { credentials: 'include' });
    const data = await res.json();
    if (data.success && data.user?.id) {
      sessionUserId = data.user.id;
    } else {
      throw new Error('Not logged in');
    }
  } catch (err) {
    console.error('❌ Could not fetch session user ID:', err);
  }
}

/* -----------------------------------------------
   Gather Form Data
-------------------------------------------------*/
function gatherFormData() {
  const form = new FormData();

  if (!sessionUserId || isNaN(sessionUserId)) {
    alert("❌ You must be logged in to submit a project.");
    throw new Error("Invalid session user ID");
  }

  form.append("title", document.getElementById("title").value);
  form.append("Short_description", document.getElementById("shortDesc").value);
  form.append("project_lead", document.getElementById("lead").value);
  form.set("category", document.getElementById("category").value);
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
      form.append("repo_url", repoURL.trim());
      form.append("stars", stars || 0);
      form.append("forks", forks || 0);
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
   Spinner and Submit
-------------------------------------------------*/
async function submitProject(e) {
  e.preventDefault();

  document.getElementById('uploadSpinner').style.display = 'flex';

  try {
    const formData = gatherFormData();
    const res = await fetch("/user/upload-project", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const result = await res.json();
    if (res.ok && result.success) {
      showSuccessModal();
    } else {
      alert("❌ Upload failed: " + (result.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error submitting project:", err);
    alert("❌ Upload failed due to network error.");
  } finally {
    document.getElementById('uploadSpinner').style.display = 'none';
  }
}


/* -----------------------------------------------
   File Input Handling with PDF-only and Append Support
-------------------------------------------------*/
function bytesToMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function handleFileInput(inputId, summaryId, fieldName, options = {}) {
  const input = document.getElementById(inputId);
  const summary = document.getElementById(summaryId);

  if (!handleFileInput._fileStores) handleFileInput._fileStores = {};
  if (!handleFileInput._fileStores[inputId]) handleFileInput._fileStores[inputId] = [];
  let accumulatedFiles = handleFileInput._fileStores[inputId];

  function renderSummary() {
    summary.innerHTML = `<strong>Selected Files:</strong><ul style="list-style:none;padding:0;">`;
    accumulatedFiles.forEach((file, index) => {
      const listItem = document.createElement("li");
      listItem.style.marginBottom = "10px";

      let itemContent = `
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <div>
            ${file.name} (${bytesToMB(file.size)} MB)
            <button style="margin-left:10px; color:red; cursor:pointer;" data-index="${index}">❌</button>
          </div>
      `;

      if (!options.accept && file.type.startsWith("image/")) {
        const imgURL = URL.createObjectURL(file);
        itemContent += `
          <img src="${imgURL}" style="max-width:150px; max-height:150px; border:1px solid #ccc; border-radius:4px;" alt="Preview">
        `;
      }

      itemContent += `</div>`;
      listItem.innerHTML = itemContent;
      summary.querySelector("ul").appendChild(listItem);

      listItem.querySelector("button").addEventListener("click", () => {
        accumulatedFiles.splice(index, 1);
        updateFileInput(input, accumulatedFiles);
        renderSummary();
      });
    });

    summary.classList.toggle("hidden", accumulatedFiles.length === 0);
  }

  input.addEventListener("change", () => {
    let newFiles = Array.from(input.files);

    if (options.accept === "pdf") {
      newFiles = newFiles.filter(file => {
        if (file.type !== "application/pdf") {
          alert(`❌ ${file.name} is not a PDF and was skipped.`);
          return false;
        }
        return true;
      });
    }

    if (options.append) {
      accumulatedFiles.push(...newFiles);
    } else {
      accumulatedFiles = newFiles;
      handleFileInput._fileStores[inputId] = accumulatedFiles;
    }

    accumulatedFiles = accumulatedFiles.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`❌ ${file.name} is over 50MB and was skipped.`);
        return false;
      }
      return true;
    });
    handleFileInput._fileStores[inputId] = accumulatedFiles;

    updateFileInput(input, accumulatedFiles);
    renderSummary();
  });

  if (accumulatedFiles.length > 0) {
    renderSummary();
  }
}

function updateFileInput(input, validFiles) {
  const dataTransfer = new DataTransfer();
  validFiles.forEach(file => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
}

/* -----------------------------------------------
   DOM Ready
-------------------------------------------------*/
document.addEventListener("DOMContentLoaded", async () => {
  await fetchSessionUserId();
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

  handleFileInput("documentsInput", "documentsSummary", "documents[]", { accept: "pdf" });
  handleFileInput("screenshotsInput", "screenshotsSummary", "screenshots[]", { append: true });
  handleFileInput("profileImageInput", "profileImageSummary", "project_profile_picture");
});

/* -----------------------------------------------
   Custom File Upload Triggers
-------------------------------------------------*/
document.getElementById("uploadDocumentsBtn").addEventListener("click", () => {
  document.getElementById("documentsInput").click();
});
document.getElementById("uploadScreenshotsBtn").addEventListener("click", () => {
  document.getElementById("screenshotsInput").click();
});
document.getElementById('uploadProfileBtn').addEventListener('click', () => {
  document.getElementById('profileImageInput').click();
});

/* -----------------------------------------------
   Logout
-------------------------------------------------*/
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
function showSuccessModal() {
  const modal = document.getElementById('successModal');
  const countdownSpan = document.getElementById('countdown');
  let countdown = 10;
  modal.style.display = 'flex';
  countdownSpan.textContent = countdown;

  const interval = setInterval(() => {
    countdown--;
    countdownSpan.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(interval);
      window.location.href = "/explore-projects";
    }
  }, 1000);

  document.getElementById('cancelRedirect').onclick = () => {
    clearInterval(interval);
    modal.style.display = 'none';
  };

  document.getElementById('proceedNow').onclick = () => {
    clearInterval(interval);
    window.location.href = "/explore-projects";
  };
}
