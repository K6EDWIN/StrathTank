const params = new URLSearchParams(window.location.search);
const projectId = params.get("projectId");

let currentUserId = null;

// ==========================
// LOAD PROJECT DATA
// ==========================
async function loadProjectData() {
  try {
    const res = await fetch(`/api/projects/${projectId}/details`);
    const project = await res.json();

    const heroSection = document.querySelector(".hero");
    const fallbackImage = '/assets/strath.png';

    const rawPath = project.file_path?.trim();
    if (rawPath) {
      const normalizedPath = rawPath.replace(/\\/g, '/');
      const fullImagePath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

      const testImage = new Image();
      testImage.onload = () => {
        heroSection.style.backgroundImage = `url('${fullImagePath}')`;
      };
      testImage.onerror = () => {
        heroSection.style.backgroundImage = `url('${fallbackImage}')`;
      };
      testImage.src = fullImagePath;
    } else {
      heroSection.style.backgroundImage = `url('${fallbackImage}')`;
    }

    document.getElementById("project-title").textContent = project.title;
    document.getElementById("project-short-description").textContent = project.short_description;
    document.getElementById("project-overview").textContent = project.overview;

    const tagContainer = document.getElementById("tag-container");
    tagContainer.innerHTML = '';
    project.tags.forEach(tag => {
      const span = document.createElement("span");
      span.textContent = tag;
      tagContainer.appendChild(span);
    });

    const techList = document.getElementById("project-details");
    techList.innerHTML = '';
    const headings = ["Project Focus", "Target Beneficiaries", "Methodology", "Impact Goals"];
    const sections = (project.technical_details || '').split(new RegExp(`(?=${headings.join('|')}:)`, 'g'));
    sections.forEach(section => {
      const [heading, content] = section.split(":");
      if (heading && content) {
        techList.innerHTML += `<li><strong>${heading.trim()}:</strong> ${content.trim()}</li>`;
      }
    });

    const infoList = document.getElementById("project-info");
    infoList.innerHTML = `
      <li><strong>Status:</strong> ${project.status}</li>
      <li><strong>Launch Date:</strong> ${project.launch_date}</li>
      <li><strong>Project Lead:</strong> ${project.project_lead}</li>
      <li><strong>Team Size:</strong> ${project.team_size}</li>
    `;

    document.getElementById("like-count").textContent = project.likes;

    const screenGrid = document.getElementById("screenshots");
    screenGrid.innerHTML = '';
    project.screenshots.forEach((src, i) => {
      screenGrid.innerHTML += `
        <div class="design-card">
          <img src="${src}" alt="Screenshot ${i + 1}" />
          <p>Screenshot ${i + 1}</p>
        </div>
      `;
    });

    const docRow = document.getElementById("documents");
    docRow.innerHTML = '';
    project.documents.forEach(doc => {
      const fileUrl = doc.replace(/^\/?uploads[\\/]/, '/uploads/').replace(/\\/g, '/');
      const fullName = fileUrl.split('/').pop();
      const readableName = fullName.replace(/^\d+(?:-\d+)*-/, '');
      docRow.innerHTML += `
        <div class="card">
          <div class="icon">📄</div>
          <div class="doc-info">
            <p>${readableName}</p>
            <button class="view-doc-btn" data-src="${fileUrl}">View</button>
          </div>
        </div>
      `;
    });

    // Admin buttons
   const approveBtn = document.getElementById('approve-btn');
const rejectBtn = document.getElementById('reject-btn');

console.log('Status from API:', project.status);

if (project.status && project.status.toLowerCase() === 'pending') {
  approveBtn.style.removeProperty('display');
  rejectBtn.style.removeProperty('display');
} else {
  approveBtn.style.display = 'none';
  rejectBtn.style.display = 'none';
}


    const suspendBtn = document.getElementById("suspend-btn");
   suspendBtn.textContent = project.status.toLowerCase() === "suspended" ? "Unsuspend" : "Suspend";
    suspendBtn.style.display = project.status.toLowerCase() !== "pending" ? "inline-block" : "none";


  } catch (err) {
    console.error("Error loading project:", err);
    alert("Failed to load project.");
  }
}

// ==========================
// NORMALIZE PROFILE IMAGE PATH
// ==========================
function normalizeProfileImage(path) {
  if (!path || typeof path !== "string" || path.trim() === "") {
    return "/assets/noprofile.jpg";
  }
  let normalized = path.replace(/\\/g, "/").replace(/\s+/g, " ").trim();
  if (normalized.startsWith("/")) normalized = normalized.slice(1);
  return `/${normalized}`;
}

// ==========================
// LOAD TEAM MEMBERS
// ==========================
async function loadTeam() {
  try {
    const currentUserRes = await fetch('/user', { credentials: 'include' });
    const currentUserData = await currentUserRes.json();
    currentUserId = currentUserData?.user?.id;

    const res = await fetch(`/api/projects/${projectId}/team`);
    const team = await res.json();

    const teamContainer = document.getElementById("team-members");
    teamContainer.innerHTML = '';

    team.forEach(member => {
      const profileImage = normalizeProfileImage(member.profile_photo);
      const isCurrentUser = String(member.user_id) === String(currentUserId);
      const profileLink = isCurrentUser ? '/profile' : `/otherProfile?userId=${member.user_id}`;

      teamContainer.innerHTML += `
        <div class="card">
          <img src="${profileImage}" alt="${member.name || 'Unnamed'}"
               onerror="this.src='/assets/noprofile.jpg'" />
          <div class="doc-info">
            <p>${member.name || 'Unnamed'}</p>
            <p>${member.role || 'No role specified'}</p>
            <button onclick="window.location.href='${profileLink}'">View Profile</button>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error("❌ loadTeam failed:", err.message);
  }
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
// ADMIN BUTTON HANDLERS
// ==========================
// ==========================
// APPROVE / REJECT HANDLERS
// ==========================
document.getElementById("approve-btn")?.addEventListener("click", () => handleApprovalAction("approve"));
document.getElementById("reject-btn")?.addEventListener("click", () => handleApprovalAction("reject"));

async function handleApprovalAction(action) {
  const confirmMsg = action === "approve"
    ? "Are you sure you want to approve this project?"
    : "Are you sure you want to reject this project?";

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`/admin/${action}/${projectId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    if (data.success) {
      alert(`✅ Project ${action}d successfully.`);
      await loadProjectData(); // Refresh data to update UI
    } else {
      alert(`❌ ${action} failed: ${data.message || "Unknown error."}`);
    }
  } catch (err) {
    console.error(`[${action.toUpperCase()} ERROR]:`, err);
    alert(`❌ Could not ${action} the project. Please try again later.`);
  }
}


// ==========================
// SUSPEND PROJECT
// ==========================

async function suspendProject() {
  const suspendBtn = document.getElementById('suspend-btn');
  if (!suspendBtn) return;

  // Determine current action based on button text (case-insensitive check)
  let action;
  const isUnsuspend = suspendBtn.textContent.toLowerCase().includes('unsuspend');

  if (isUnsuspend) {
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
      await loadProjectData();  // Refresh data to update button label and status
    } else {
      alert('❌ Failed: ' + (data.message || 'Unknown error.'));
    }
  } catch (err) {
    console.error('❌ Suspend error:', err);
    alert('❌ Could not update project status. Try again later.');
  }
}




// ==========================
// LIKE TOGGLE
// ==========================
document.getElementById("like-section")?.addEventListener("click", async () => {
  try {
    const res = await fetch(`/api/projects/${projectId}/like`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await res.json();
    document.getElementById("like-count").textContent = data.newLikeCount;
    document.getElementById("like-status").textContent = data.status === "liked" ? "❤️ " : "🤍 ";
  } catch (err) {
    alert("Something went wrong.");
  }
});

// ==========================
// DOCUMENT VIEWER (PDF.js)
// ==========================
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', () => {
  loadProjectData();
  loadTeam();
  loadComments();

  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("view-doc-btn")) {
      const src = e.target.getAttribute("data-src");
      const overlay = document.getElementById("documentOverlay");
      const canvas = document.getElementById("pdf-canvas");
      const ctx = canvas.getContext("2d");

      overlay.classList.remove("hidden");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        const loadingTask = pdfjsLib.getDocument(src);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error("PDF.js error:", err);
        alert("⚠️ Could not load PDF.");
      }
    }

    if (e.target.id === "close-overlay") {
      closeDocumentOverlay();
    }
  });

  document.getElementById('confirmLogoutBtn')?.addEventListener('click', logout);
  document.getElementById('cancelLogoutBtn')?.addEventListener('click', closeLogoutConfirm);
});

function closeDocumentOverlay() {
  const overlay = document.getElementById("documentOverlay");
  const canvas = document.getElementById("pdf-canvas");
  const ctx = canvas.getContext("2d");

  overlay.classList.add("hidden");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ==========================
// LOGOUT
// ==========================
function openLogoutConfirm() {
  document.getElementById('logout-confirm-modal').style.display = 'flex';
}
function closeLogoutConfirm() {
  document.getElementById('logout-confirm-modal').style.display = 'none';
}
function showLogoutLoader() {
  document.getElementById('logout-loader').style.display = 'flex';
}
function hideLogoutLoader() {
  document.getElementById('logout-loader').style.display = 'none';
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

// Expose for inline
window.openLogoutConfirm = openLogoutConfirm;
window.closeLogoutConfirm = closeLogoutConfirm;
window.logout = logout;
