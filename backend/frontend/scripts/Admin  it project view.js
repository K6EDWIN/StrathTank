// ==========================
// STATE
// ==========================
const params = new URLSearchParams(window.location.search);
const projectId = params.get('projectId');
let currentUserId = null;

// ==========================
// INITIALIZE
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  loadProjectData();
  loadTeam();
  loadComments();
document.getElementById('approve-btn')?.addEventListener('click', () => handleApprovalAction('approve'));
document.getElementById('reject-btn')?.addEventListener('click', () => handleApprovalAction('reject'));

  document.querySelector('.viewGithub')?.addEventListener('click', viewGithubRepo);
  document.querySelector('.collaborate')?.addEventListener('click', sendCollaborationRequest);

  document.querySelector('.flagproject')?.addEventListener('click', () => {
    document.getElementById('flag-popup').classList.remove('hidden');
  });

  document.getElementById('cancel-flag')?.addEventListener('click', () => {
    document.getElementById('flag-popup').classList.add('hidden');
    document.getElementById('flag-reason').value = '';
  });

  document.getElementById('submit-flag')?.addEventListener('click', submitFlag);

  document.getElementById('like-section')?.addEventListener('click', toggleLike);
  document.getElementById('suspend-btn')?.addEventListener('click', suspendProject);


  // Logout modal buttons
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', logout);

  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
  if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', closeLogoutConfirm);

  // Other event listeners
  document.addEventListener('click', handleCommentClicks);
});

// ==========================
// LOGOUT MODAL & LOADER
// ==========================
const logoutLoader = document.getElementById('logout-loader');

function openLogoutConfirm() {
  const modal = document.getElementById('logout-confirm-modal');
  if (modal) modal.style.display = 'flex';
}

function closeLogoutConfirm() {
  const modal = document.getElementById('logout-confirm-modal');
  if (modal) modal.style.display = 'none';
}

function showLogoutLoader() {
  if (logoutLoader) logoutLoader.style.display = 'flex';
}

function hideLogoutLoader() {
  if (logoutLoader) logoutLoader.style.display = 'none';
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

// ==========================
// LOAD PROJECT DATA
// ==========================
async function loadProjectData() {
 try {
  const res = await fetch(`/api/projects/${projectId}/details`, { credentials: 'include' });
  const project = await res.json();

  setHeroImage(project.file_path);
  document.getElementById('project-title').textContent = project.title;
  document.getElementById('project-short-description').textContent = project.short_description;
  document.getElementById('project-overview').textContent = project.overview;
  renderTags(project.tags);
  renderTechnicalDetails(project.technical_details);
  renderInfoList(project);
  document.getElementById('like-count').textContent = project.likes;
  renderScreenshots(project.screenshots);
  renderDocuments(project.documents);

  // Toggle suspend button
  const suspendBtn = document.getElementById('suspend-btn');
  if (suspendBtn) {
   suspendBtn.disabled = false;
   suspendBtn.textContent = project.status === 'suspended'
    ? 'Unsuspend Project'
    : 'Suspend Project';
  }

  // Show/hide approve & reject buttons based on project status
  const approveBtn = document.getElementById('approve-btn');
  const rejectBtn = document.getElementById('reject-btn');
  if (project.status.toLowerCase() === 'pending') {
   approveBtn.style.display = 'inline-block';
   rejectBtn.style.display = 'inline-block';
  } else {
   approveBtn.style.display = 'none';
   rejectBtn.style.display = 'none';
  }

 } catch (err) {
  console.error('❌ loadProjectData failed:', err);
 }
}


function setHeroImage(path) {
  const heroSection = document.querySelector('.hero');
  const fallback = '/assets/strath.png';
  if (!path) {
    heroSection.style.backgroundImage = `url('${fallback}')`;
    return;
  }
  const normalized = '/' + path.trim().replace(/\\/g, '/').replace(/^\/+/, '');
  const testImg = new Image();
  testImg.onload = () => {
    heroSection.style.backgroundImage = `url('${normalized}')`;
  };
  testImg.onerror = () => {
    heroSection.style.backgroundImage = `url('${fallback}')`;
  };
  testImg.src = normalized;
}

function renderTags(tags) {
  const container = document.getElementById('tag-container');
  container.innerHTML = '';
  tags.forEach(tag => {
    const span = document.createElement('span');
    span.textContent = tag;
    container.appendChild(span);
  });
}

function renderTechnicalDetails(details) {
  const techList = document.getElementById('technical-details');
  techList.innerHTML = '';
  if (!details) return;

  const headings = ['Programming', 'Frameworks', 'Database', 'Deployment'];
  const sections = details.split(new RegExp(`(?=${headings.join('|')}:)`, 'g'));
  sections.forEach(section => {
    const [heading, content] = section.split(':');
    if (heading && content) {
      const lines = content.split(/[\.,]/).map(s => s.trim()).filter(Boolean);
      techList.innerHTML += `
        <li><strong>${heading.trim()}:</strong><br/>${lines.join('<br/>')}</li>
      `;
    }
  });
}

function renderInfoList(project) {
  document.getElementById('project-info').innerHTML = `
    <li><strong>Status:</strong> ${project.status}</li>
    <li><strong>Launch Date:</strong> ${project.launch_date}</li>
    <li><strong>Project Lead:</strong> ${project.project_lead}</li>
    <li><strong>Team Size:</strong> ${project.team_size}</li>
  `;
}

function renderScreenshots(screenshots) {
  const grid = document.getElementById('screenshots');
  grid.innerHTML = '';
  screenshots.forEach((src, i) => {
    grid.innerHTML += `
      <div class="design-card">
        <img src="${src}" alt="Screenshot ${i + 1}" />
        <p>Screenshot ${i + 1}</p>
      </div>
    `;
  });
}

function renderDocuments(documents) {
  const container = document.getElementById('documents');
  container.innerHTML = '';
  documents.forEach(doc => {
    const fileUrl = doc.replace(/^\/?uploads[\\/]/, '/uploads/').replace(/\\/g, '/');
    const name = fileUrl.split('/').pop().replace(/^\d+(?:-\d+)*-/, '');
    container.innerHTML += `
      <div class="card">
        <div class="icon">📄</div>
        <div class="doc-info">
          <p>${name}</p>
          <button class="view-doc-btn" data-src="${fileUrl}">View</button>
        </div>
      </div>
    `;
  });
}

// ==========================
// LOAD TEAM
// ==========================
async function loadTeam() {
  try {
    const userRes = await fetch('/user', { credentials: 'include' });
    const userData = await userRes.json();
    currentUserId = userData?.user?.id;

    const res = await fetch(`/api/projects/${projectId}/team`, { credentials: 'include' });
    const team = await res.json();
    if (!Array.isArray(team)) throw new Error('Team data invalid');

    const container = document.getElementById('team-members');
    container.innerHTML = '';
    team.forEach(member => {
      const profileImage = normalizeProfileImage(member.profile_photo);
      const isMe = String(member.user_id) === String(currentUserId);
      const link = isMe ? '/profile' : `/otherProfile?userId=${member.user_id}`;
      container.innerHTML += `
        <div class="card">
          <img src="${profileImage}" alt="${member.name || 'Unnamed'}" onerror="this.src='/assets/noprofile.jpg'"/>
          <div class="doc-info">
            <p>${member.name || 'Unnamed'}</p>
            <p>${member.role || 'No role specified'}</p>
            <button onclick="window.location.href='${link}'">View Profile</button>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error('❌ loadTeam failed:', err);
  }
}

function normalizeProfileImage(path) {
  if (!path || !path.trim()) return '/assets/noprofile.jpg';
  return '/' + path.trim().replace(/\\/g, '/').replace(/^\/+/, '');
}

// ==========================
// LOAD COMMENTS
// ==========================
async function loadComments() {
  try {
    const res = await fetch('/user');
    const userData = await res.json();
    currentUserId = userData?.user?.id;

    const commentRes = await fetch(`/api/projects/${projectId}/comments`);
    const data = await commentRes.json();

    const commentsDiv = document.getElementById("comments-list");
    if (!Array.isArray(data)) {
      commentsDiv.innerHTML = "<p>Error loading comments</p>";
      return;
    }

    const grouped = {};
    data.forEach(c => {
      const pid = c.parent_id || "root";
      grouped[pid] = grouped[pid] || [];
      grouped[pid].push(c);
    });

    function renderComment(c, depth = 0) {
      const rawPhoto = (c.user_profile_photo || '').trim();
      const profilePic = rawPhoto
        ? `/${rawPhoto.replace(/\\/g, '/').replace(/\s/g, '%20')}`
        : '/assets/noprofile.jpg';

      const isOwner = currentUserId && currentUserId == c.user_id;
      const replies = grouped[c.id] || [];

      let repliesHTML = '';
      if (replies.length > 0) {
        const replyList = replies.map(reply => renderComment(reply, depth + 1)).join("");
        repliesHTML = `
          <div class="replies-container hidden" id="replies-${c.id}">
            ${replyList}
          </div>
          <button class="toggle-replies" data-id="${c.id}">➕ Show Replies (${replies.length})</button>
        `;
      }

      return `
        <div class="comment" data-comment-id="${c.id}" style="margin-left: ${depth * 20}px;">
          <div class="comment-header">
            <img src="${profilePic}" alt="${c.user_name}" class="comment-avatar" />
            <div class="comment-meta">
              <strong class="comment-user">${c.user_name}</strong>
              <small class="comment-time">${new Date(c.created_at).toLocaleString()}</small>
            </div>
          </div>
          <p class="comment-content">${c.content}</p>
          <div class="comment-actions">
            ${isOwner ? `<button class="delete-comment" data-id="${c.id}">🗑️ Delete</button>` : ''}
            <button class="reply-comment" data-id="${c.id}" data-user="${c.user_name}">💬 Reply</button>
          </div>
          <div class="reply-box-container"></div>
          ${repliesHTML}
        </div>
      `;
    }

    const rootComments = grouped["root"] || [];
    commentsDiv.innerHTML = '';
    rootComments.forEach(c => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = renderComment(c);
      commentsDiv.appendChild(wrapper.firstElementChild);
    });

  } catch (err) {
    console.error("⚠️ Fetch error:", err);
    document.getElementById("comments-list").innerHTML = "<p>Failed to fetch comments</p>";
  }
}

// Unified comment click handler (reply + delete + toggle replies)
document.getElementById('comments-list').addEventListener('click', async (e) => {
  const replyBtn = e.target.closest('.reply-comment');
  const deleteBtn = e.target.closest('.delete-comment');
  const toggleBtn = e.target.closest('.toggle-replies');

  if (replyBtn) {
    const commentId = replyBtn.dataset.id;
    const userName = replyBtn.dataset.user;
    const parentComment = replyBtn.closest('.comment');
    const container = parentComment.querySelector('.reply-box-container');

    if (container.querySelector('.reply-form')) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <form class="reply-form" data-parent-id="${commentId}">
        <textarea required placeholder="Reply to @${userName}" class="reply-input"></textarea>
        <button type="submit" class="submit-reply-btn">Reply</button>
      </form>
    `;
  }

  if (deleteBtn) {
    const commentId = deleteBtn.dataset.id;
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  }

  if (toggleBtn) {
    const id = toggleBtn.dataset.id;
    const container = document.getElementById(`replies-${id}`);
    if (!container) return;
    const isHidden = container.classList.toggle('hidden');
    toggleBtn.textContent = isHidden
      ? `➕ Show Replies (${container.children.length})`
      : `➖ Hide Replies`;
  }
});

// Reply submit
document.getElementById('comments-list').addEventListener('submit', async (e) => {
  const form = e.target;
  if (!form.classList.contains('reply-form')) return;

  e.preventDefault();
  const parentId = form.dataset.parentId;
  const content = form.querySelector('.reply-input').value.trim();
  if (!content) return alert("Reply cannot be empty");

  try {
    const res = await fetch(`/api/projects/${projectId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parent_id: parentId })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to post reply");

    await loadComments();
  } catch (err) {
    console.error("❌ Reply submit failed:", err);
    alert("❌ " + err.message);
  }
});

// Delete comment
async function deleteComment(commentId) {
  try {
    const res = await fetch(`/api/projects/comments/${commentId}`, {

      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      const text = await res.text(); // get raw text instead of json
      console.error("❌ Delete response (not ok):", text);
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    await loadComments();
  } catch (err) {
    console.error("❌ Delete error:", err);
    alert("❌ " + err.message);
  }
}
// ==========================
// LIKE
// ==========================
async function toggleLike() {
  try {
    const res = await fetch(`/api/projects/${projectId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json();
    document.getElementById('like-count').textContent = data.newLikeCount;
    document.getElementById('like-status').textContent = data.status === 'liked' ? '❤️' : '🤍';
  } catch (err) {
    console.error('💥 Like error:', err);
    alert('Something went wrong.');
  }
}

// ==========================
// DOCUMENT VIEW
// ==========================
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('view-doc-btn')) {
    await openDocumentOverlay(e.target.getAttribute('data-src'));
  }
});

async function openDocumentOverlay(src) {
  const overlay = document.getElementById('documentOverlay');
  const canvas = document.getElementById('pdf-canvas');
  const ctx = canvas.getContext('2d');

  overlay.classList.remove('hidden');

  try {
    const loadingTask = window.pdfjsLib.getDocument(src);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
  } catch (err) {
    console.error('PDF.js error:', err);
    alert('⚠️ Could not load PDF.');
  }
}

function closeDocumentOverlay() {
  const overlay = document.getElementById('documentOverlay');
  const canvas = document.getElementById('pdf-canvas');
  const ctx = canvas.getContext('2d');
  overlay.classList.add('hidden');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ==========================
// GITHUB BUTTON
// ==========================
async function viewGithubRepo() {
  try {
    const res = await fetch(`/api/projects/${projectId}/github`, { credentials: 'include' });
    if (!res.ok) throw new Error('GitHub fetch failed');
    const data = await res.json();
    let url = (data.repo_url || '').trim();
    if (!url) return alert('🚫 No repo for this project yet.');
    if (url.endsWith('.git')) url = url.slice(0, -4);
    if (!/^https?:\/\//.test(url)) throw new Error('Invalid URL');
    window.open(url, '_blank');
  } catch (err) {
    alert('⚠️ Could not open GitHub repo.');
    console.error('GitHub error:', err);
  }
}





// ==========================
// SUSPEND PROJECT
// ==========================

async function suspendProject() {
  const suspendBtn = document.getElementById('suspend-btn');
  if (!suspendBtn) return;

  // Determine current action based on button text
  let action;
  if (suspendBtn.textContent.includes('Unsuspend')) {
    action = 'unsuspend';
    if (!confirm('Are you sure you want to unsuspend this project?')) return;
  } else {
    action = 'suspend';
    if (!confirm('Are you sure you want to suspend this project?')) return;
  }

  try {
    const res = await fetch(`/admin/suspend-project/${projectId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });

    const data = await res.json();
    if (data.success) {
      alert(`✅ Project ${action}ed successfully.`);
      loadProjectData();
    } else {
      alert('❌ Failed: ' + (data.message || 'Unknown error.'));
    }
  } catch (err) {
    console.error('❌ Suspend error:', err);
    alert('❌ Could not update project status. Try again later.');
  }
}

async function handleApprovalAction(action) {
  const confirmMsg = action === 'approve'
    ? 'Are you sure you want to approve this project?'
    : 'Are you sure you want to reject this project?';

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`/admin/${action}/${projectId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    if (data.success) {
      alert(`✅ Project ${action}d successfully.`);
      loadProjectData(); // Refresh view to hide buttons and update status
    } else {
      alert(`❌ ${action} failed: ${data.message || 'Unknown error.'}`);
    }
  } catch (err) {
    console.error(`[${action.toUpperCase()} ERROR]:`, err);
    alert(`❌ Could not ${action} the project. Please try again later.`);
  }
}
