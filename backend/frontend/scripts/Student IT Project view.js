// ==========================
// STATE
// ==========================
const params = new URLSearchParams(window.location.search);
const projectId = params.get('projectId');
let currentUserId = null;

// ==========================
// SELECTORS
// ==========================
const logoutLoader = document.getElementById('logout-loader');

// ==========================
// INITIALIZE
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  loadProjectData();
  loadTeam();
  loadComments();

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

  document.getElementById('logoutBtn')?.addEventListener('click', openLogoutConfirm);
  document.getElementById('confirmLogoutBtn')?.addEventListener('click', logout);
  document.getElementById('cancelLogoutBtn')?.addEventListener('click', closeLogoutConfirm);

  document.addEventListener('click', handleCommentClicks);
});

// ==========================
// LOGOUT MODAL & LOADER
// ==========================
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
// COMMENTS
// ==========================
async function loadComments() {
  try {
    const resUser = await fetch('/user', { credentials: 'include' });
    const userData = await resUser.json();
    currentUserId = userData?.user?.id;

    const res = await fetch(`/api/projects/${projectId}/comments`, { credentials: 'include' });
    const data = await res.json();

    renderComments(data);
  } catch (err) {
    console.error('⚠️ loadComments error:', err);
    document.getElementById('comments-list').innerHTML = '<p>Failed to load comments</p>';
  }
}

function renderComments(data) {
  const commentsDiv = document.getElementById('comments-list');
  commentsDiv.innerHTML = '';

  if (!Array.isArray(data)) {
    commentsDiv.innerHTML = '<p>Error loading comments</p>';
    return;
  }

  const grouped = {};
  data.forEach(c => {
    const pid = c.parent_id || 'root';
    grouped[pid] = grouped[pid] || [];
    grouped[pid].push(c);
  });

  const rootComments = grouped['root'] || [];
  rootComments.forEach(c => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderComment(c, grouped);
    commentsDiv.appendChild(wrapper.firstElementChild);
  });
}

function renderComment(c, grouped, depth = 0) {
  const photo = normalizeProfileImage(c.user_profile_photo || '');
  const isOwner = currentUserId == c.user_id;
  const replies = grouped[c.id] || [];

  let repliesHTML = '';
  if (replies.length) {
    const nested = replies.map(r => renderComment(r, grouped, depth + 1)).join('');
    repliesHTML = `
      <div class="replies-container hidden" id="replies-${c.id}">${nested}</div>
      <button class="toggle-replies" data-id="${c.id}">➕ Show Replies (${replies.length})</button>
    `;
  }

  return `
    <div class="comment" data-comment-id="${c.id}" style="margin-left: ${depth * 20}px;">
      <div class="comment-header">
        <img src="${photo}" alt="${c.user_name}" class="comment-avatar" />
        <div class="comment-meta">
          <strong>${c.user_name}</strong>
          <small>${new Date(c.created_at).toLocaleString()}</small>
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

async function submitComment() {
  const content = document.getElementById('comment-text').value.trim();
  if (!content) return;

  await fetch(`/api/projects/${projectId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content })
  });

  document.getElementById('comment-text').value = '';
  loadComments();
}

async function handleCommentClicks(e) {
  if (e.target.classList.contains('delete-comment')) {
    await handleDeleteComment(e.target);
  }

  if (e.target.classList.contains('reply-comment')) {
    toggleReplyBox(e.target);
  }

  if (e.target.classList.contains('send-reply-btn')) {
    await handleSendReply(e.target);
  }

  if (e.target.classList.contains('toggle-replies')) {
    toggleReplies(e.target);
  }
}

async function handleDeleteComment(btn) {
  const id = btn.dataset.id;
  if (!confirm('Delete this comment?')) return;
  await fetch(`/api/projects/comments/${id}`, { method: 'DELETE', credentials: 'include' });
  loadComments();
}

function toggleReplyBox(btn) {
  const comment = btn.closest('.comment');
  const box = comment.querySelector('.reply-box-container');
  box.innerHTML = box.innerHTML.trim() ? '' : `
    <textarea class="reply-text" placeholder="Write a reply..."></textarea>
    <button class="send-reply-btn" data-id="${btn.dataset.id}">Reply</button>
  `;
}

async function handleSendReply(btn) {
  const parentId = btn.dataset.id;
  const textarea = btn.previousElementSibling;
  const content = textarea.value.trim();
  if (!content) return alert('Reply cannot be empty.');

  await fetch(`/api/projects/${projectId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content, parent_id: parseInt(parentId) })
  });

  loadComments();
}

function toggleReplies(btn) {
  const id = btn.dataset.id;
  const container = document.getElementById(`replies-${id}`);
  const hidden = container.classList.toggle('hidden');
  btn.textContent = hidden ? `➕ Show Replies (${container.children.length})` : '➖ Hide Replies';
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
// COLLABORATE
// ==========================
async function sendCollaborationRequest() {
  try {
    const res = await fetch(`/api/collaboration/${projectId}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json();
    alert(data.message || data.error);
  } catch (err) {
    console.error('❌ Collaborate error:', err);
    alert('Error sending collaboration request.');
  }
}

// ==========================
// FLAG
// ==========================
async function submitFlag() {
  const reason = document.getElementById('flag-reason').value.trim();
  if (!reason) return alert('Please provide a reason.');

  try {
    const title = document.getElementById('project-title').textContent || 'Untitled';
    const res = await fetch('/user/flag-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ project_id: projectId, name: title, reason })
    });
    const data = await res.json();
    if (data.success) {
      alert('✅ Project flagged successfully.');
      document.getElementById('flag-popup').classList.add('hidden');
      document.getElementById('flag-reason').value = '';
    } else {
      alert('❌ Failed: ' + (data.message || 'Something went wrong.'));
    }
  } catch (err) {
    console.error('❌ Flag error:', err);
    alert('❌ Could not flag project. Try again later.');
  }
}
