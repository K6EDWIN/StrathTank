const params = new URLSearchParams(window.location.search);
const projectId = params.get("projectId");

// ============================
// LOAD PROJECT DATA
// ============================
async function loadProjectData() {
  const projectRes = await fetch(`/api/projects/${projectId}/details`);
  const project = await projectRes.json();

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
      console.warn("⚠️ Failed to load image:", fullImagePath);
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

  const techList = document.getElementById("technical-details");
  techList.innerHTML = '';
  const headings = ['Programming', 'Frameworks', 'Database', 'Deployment'];
  const sections = project.technical_details.split(new RegExp(`(?=${headings.join('|')}:)`, 'g'));

  sections.forEach(section => {
    const [heading, content] = section.split(":");
    if (heading && content) {
      const lines = content.split(/[\.,]/).map(s => s.trim()).filter(line => line.length > 0);
      techList.innerHTML += `
        <li><strong>${heading.trim()}:</strong><br/>${lines.join("<br/>")}</li>
      `;
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
project.documents.forEach((doc, i) => {
  const fileUrl = doc.replace(/^\/?uploads[\\/]/, '/uploads/');
  const fullName = doc.replace(/\\/g, '/').split('/').pop();
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

}

// ============================
// LOAD TEAM
// ============================

function normalizeProfileImage(path) {
  if (!path || typeof path !== "string" || path.trim() === "") {
    return "/assets/noprofile.jpg";
  }
  let normalized = path.replace(/\\/g, "/").replace(/\s+/g, " ").trim();
  if (normalized.startsWith("/")) normalized = normalized.slice(1);
  return `/${normalized}`;
}

async function loadTeam() {
 try {
  const currentUserRes = await fetch('/user');
  const currentUserData = await currentUserRes.json();
  const currentUserId = currentUserData?.user?.id;

  const res = await fetch(`/api/projects/${projectId}/team`);
  const team = await res.json();
  if (!Array.isArray(team)) throw new Error("Team is not an array");

  const teamContainer = document.getElementById("team-members");
  teamContainer.innerHTML = '';

  team.forEach(member => {
   const profileImage = normalizeProfileImage(member.profile_photo);
   const isCurrentUser = String(member.user_id) === String(currentUserId);
   const profileLink = isCurrentUser
    ? '/profile'
    : `/otherProfile?userId=${member.user_id}`;

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

// ============================
// LOAD COMMENTS
// ============================
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
  commentsDiv.innerHTML = ''; // Clear existing
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

// ============================
// SUBMIT COMMENT
// ============================
async function submitComment() {
  const content = document.getElementById("comment-text").value.trim();
  if (!content) return;

  await fetch(`/api/projects/${projectId}/comment`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content })
  });

  document.getElementById("comment-text").value = '';
  loadComments();
}
// ==========================
// HANDLE DELETE / REPLY / TOGGLE
// ==========================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-comment")) {
    const commentId = e.target.dataset.id;
    if (confirm("Delete this comment?")) {
      const res = await fetch(`/api/projects/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const result = await res.json();
      if (result.success) loadComments();
      else alert(result.error || "Delete failed.");
    }
  }

  if (e.target.classList.contains("reply-comment")) {
    const comment = e.target.closest(".comment");
    const replyBox = comment.querySelector(".reply-box-container");
    replyBox.innerHTML = replyBox.innerHTML.trim() ? '' : `
      <textarea class="reply-text" placeholder="Write a reply..."></textarea>
      <button class="send-reply-btn" data-id="${e.target.dataset.id}">Reply</button>
    `;
  }

  if (e.target.classList.contains("send-reply-btn")) {
    const parentId = e.target.dataset.id;
    const textarea = e.target.previousElementSibling;
    const content = textarea.value.trim();
    if (!content) return alert("Reply cannot be empty.");

    await fetch(`/api/projects/${projectId}/comment`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        content,
        parent_id: parentId === undefined ? null : parseInt(parentId)
      })
    });

    loadComments();
  }

  if (e.target.classList.contains("toggle-replies")) {
    const commentId = e.target.dataset.id;
    const repliesDiv = document.getElementById(`replies-${commentId}`);
    const isHidden = repliesDiv.classList.contains("hidden");
    repliesDiv.classList.toggle("hidden");
    e.target.textContent = isHidden ? "➖ Hide Replies" : `➕ Show Replies (${repliesDiv.children.length})`;
  }
});

// ============================
// LIKE TOGGLE
// ============================
document.getElementById("like-section").addEventListener("click", async () => {
  try {
    const res = await fetch(`/api/projects/${projectId}/like`, {
      method: "POST",
      headers: { 'Content-type': 'application/json' },
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Something went wrong.");
      return;
    }

    document.getElementById("like-count").textContent = data.newLikeCount;
    document.getElementById("like-status").textContent = data.status === "liked" ? "❤️" : "🤍 ";
  } catch (err) {
    console.error("💥 Like toggle error:", err);
    alert("Something went wrong.");
  }
});

// ============================
// DOCUMENT VIEW OVERLAY
// ============================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("view-doc-btn")) {
    const src = e.target.getAttribute("data-src");
    const overlay = document.getElementById("documentOverlay");
    const canvas = document.getElementById("pdf-canvas");
    const ctx = canvas.getContext("2d");

    overlay.classList.remove("hidden");

    try {
      const loadingTask = window['pdfjsLib'].getDocument(src);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1); // Render only page 1 for now

      const viewport = page.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error("PDF.js error:", err);
      alert("⚠️ Could not load PDF.");
    }
  }
});

function closeDocumentOverlay() {
  const overlay = document.getElementById("documentOverlay");
  const canvas = document.getElementById("pdf-canvas");
  const ctx = canvas.getContext("2d");

  overlay.classList.add("hidden");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
}


// ============================
// INITIALIZE ON LOAD
// ============================
document.addEventListener('DOMContentLoaded', () => {
  loadProjectData();
  loadTeam();
  loadComments();

  // ========================
  // GITHUB VIEW BUTTON
  // ========================
  document.querySelector(".viewGithub").addEventListener("click", async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/github`);
      if (!res.ok) {
        if (res.status === 404) {
          alert("🚫 No repo for this project yet, sorry.");
        } else {
          throw new Error("GitHub repo fetch failed");
        }
        return;
      }

      const data = await res.json();
      let url = (data.repo_url || "").trim();

      if (!url) {
        alert("🚫 No repo for this project yet, sorry.");
        return;
      }

      if (url.endsWith(".git")) url = url.slice(0, -4);
      if (!/^https?:\/\/.+/.test(url)) {
        alert("❗ Invalid GitHub URL");
        return;
      }

      window.open(url, "_blank");
    } catch (err) {
      alert("⚠️ Could not open GitHub repo. Please try again.");
      console.error("GitHub view error:", err);
    }
  });
});

// ============================
// COLLABORATE REQUEST
// ============================
document.querySelector('.collaborate').addEventListener('click', async () => {
  try {
    const res = await fetch(`/api/collaboration/${projectId}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await res.json();
    alert(data.message || data.error);
  } catch (err) {
    console.error(err);
    alert('Error sending collaboration request.');
  }
});

// ============================
// FLAG PROJECT
// ============================
document.querySelector('.flagproject')?.addEventListener('click', () => {
  document.getElementById('flag-popup').classList.remove('hidden');
});

document.getElementById('cancel-flag')?.addEventListener('click', () => {
  document.getElementById('flag-popup').classList.add('hidden');
  document.getElementById('flag-reason').value = '';
});

document.getElementById('submit-flag')?.addEventListener('click', async () => {
  const reason = document.getElementById('flag-reason').value.trim();
  if (!reason) {
    alert("Please provide a reason.");
    return;
  }

  try {
    const title = document.getElementById("project-title")?.textContent || "Untitled";

    const res = await fetch('/user/flag-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        project_id: projectId,
        name: title,
        reason
      })
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Project flagged successfully.");
      document.getElementById('flag-popup').classList.add('hidden');
      document.getElementById('flag-reason').value = '';
    } else {
      alert("❌ Failed: " + (data.message || "Something went wrong."));
    }
  } catch (err) {
    alert("❌ Could not flag project. Try again later.");
    console.error(err);
  }
});
