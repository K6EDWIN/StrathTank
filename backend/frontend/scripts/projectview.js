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
    const ext = doc.split('.').pop().toLowerCase();
    const fileUrl = doc.replace(/^\/?uploads\//, '/uploads/');

    docRow.innerHTML += `
      <div class="card">
        <div class="icon">📄</div>
        <div class="doc-info">
          <p>${doc}</p>
          <button class="view-doc-btn" data-src="${fileUrl}">View</button>
        </div>
      </div>
    `;
  });
}

// ============================
// LOAD TEAM
// ============================
async function loadTeam() {
  try {
    const res = await fetch(`/api/projects/${projectId}/team`);
    const team = await res.json();
    if (!Array.isArray(team)) throw new Error("Team is not an array");

    const teamContainer = document.getElementById("team-members");
    teamContainer.innerHTML = '';
    team.forEach(member => {
      const rawPhoto = (member.profile_photo || '').trim();
      const normalizedPhoto = rawPhoto
        .replace(/\\/g, '/')
        .replace(/\s+/g, '')
        .replace(/^\/?uploads\//, '');

      const profileImage = normalizedPhoto
        ? `/uploads/${normalizedPhoto}`
        : '/assets/noprofile.jpg';

      teamContainer.innerHTML += `
        <div class="card">
          <img src="${profileImage}" alt="${member.name}" onerror="this.src='/assets/noprofile.jpg'" />
          <div class="doc-info">
            <p>${member.name}</p>
            <p>${member.role}</p>
            <button>View Profile</button>
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
    const res = await fetch(`/api/projects/${projectId}/comments`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("💥 Error loading comments:", data);
      document.getElementById("comments-list").innerHTML = "<p>Error loading comments</p>";
      return;
    }

    const commentsDiv = document.getElementById("comments-list");
    commentsDiv.innerHTML = data.map(c => `
      <div class="comment">
        <strong>${c.user_name}</strong><br/>
        <p>${c.content}</p>
        <small>${new Date(c.created_at).toLocaleString()}</small>
      </div>
    `).join('');
  } catch (err) {
    console.error("⚠️ Fetch error:", err);
    document.getElementById("comments-list").innerHTML = "<p>Failed to fetch comments</p>";
  }
}

// ============================
// SUBMIT COMMENT
// ============================
async function submitComment() {
  const content = document.getElementById("comment-text").value;
  if (!content) return;

  await fetch(`/api/projects/${projectId}/comment`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });

  document.getElementById("comment-text").value = '';
  loadComments();
}

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
    document.getElementById("like-status").textContent = data.status === "liked" ? "❤️ Liked" : "🤍 Like";
  } catch (err) {
    console.error("💥 Like toggle error:", err);
    alert("Something went wrong.");
  }
});

// ============================
// DOCUMENT VIEW OVERLAY
// ============================
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-doc-btn")) {
    const src = e.target.getAttribute("data-src");
    const overlay = document.getElementById("documentOverlay");
    const frame = document.getElementById("doc-frame");

    frame.src = src;
    overlay.classList.remove("hidden");
  }

  if (e.target.id === "close-overlay") {
    const overlay = document.getElementById("documentOverlay");
    const frame = document.getElementById("doc-frame");

    frame.src = "";
    overlay.classList.add("hidden");
  }
});

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
