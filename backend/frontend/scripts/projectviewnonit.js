const params = new URLSearchParams(window.location.search);
const projectId = params.get("projectId");

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
      heroSection.style.backgroundImage = `url('${fallbackImage}')`;
    };
    testImage.src = fullImagePath;
  } else {
    heroSection.style.backgroundImage = `url('${fallbackImage}')`;
  }

  // Populate content
  document.getElementById("project-title").textContent = project.title;
  document.getElementById("project-short-description").textContent = project.short_description;
  document.getElementById("project-overview").textContent = project.overview;

  // Tags
  const tagContainer = document.getElementById("tag-container");
  tagContainer.innerHTML = '';
  project.tags.forEach(tag => {
    const span = document.createElement("span");
    span.textContent = tag;
    tagContainer.appendChild(span);
  });

  // Project Details (non-technical)
const techList = document.getElementById("project-details");
techList.innerHTML = '';
const techDetails = project.technical_details || '';

const headings = [
  "Project Focus",
  "Target Beneficiaries",
  "Methodology",
  "Impact Goals"
];

const sections = techDetails.split(new RegExp(`(?=${headings.join('|')}:)`, 'g'));
sections.forEach(section => {
  const [heading, content] = section.split(":");
  if (heading && content) {
    techList.innerHTML += `
      <li><strong>${heading.trim()}:</strong> ${content.trim()}</li>
    `;
  }
});


  // General Info
  const infoList = document.getElementById("project-info");
  infoList.innerHTML = `
    <li><strong>Status:</strong> ${project.status}</li>
    <li><strong>Launch Date:</strong> ${project.launch_date}</li>
    <li><strong>Project Lead:</strong> ${project.project_lead}</li>
    <li><strong>Team Size:</strong> ${project.team_size}</li>
  `;

  document.getElementById("like-count").textContent = project.likes;

  // Visuals
  const screenGrid = document.getElementById("screenshots");
  screenGrid.innerHTML = '';
  project.screenshots.forEach((src, i) => {
    screenGrid.innerHTML += `
      <div class="design-card">
        <img src="${src}" alt="Visual ${i + 1}" />
        <p>Visual ${i + 1}</p>
      </div>
    `;
  });

  // Documents
  const docRow = document.getElementById("documents");
  docRow.innerHTML = '';
  project.documents.forEach(doc => {
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
//load team
async function loadTeam() {
  try {
    const res = await fetch(`/api/projects/${projectId}/team`);
    const team = await res.json();

    const teamContainer = document.getElementById("team-members");
    teamContainer.innerHTML = '';
    team.forEach(member => {
      const photo = (member.profile_photo || '').trim().replace(/\\/g, '/');
      const profileImage = photo ? `/uploads/${photo}` : '/assets/noprofile.jpg';

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
    console.error("❌ Error loading team:", err.message);
  }
}
//load comments
async function loadComments() {
  try {
    const res = await fetch(`/api/projects/${projectId}/comments`);
    const data = await res.json();

    const commentsDiv = document.getElementById("comments-list");
    commentsDiv.innerHTML = data.map(c => `
      <div class="comment">
        <strong>${c.user_name}</strong>
        <p>${c.content}</p>
        <small>${new Date(c.created_at).toLocaleString()}</small>
      </div>
    `).join('');
  } catch (err) {
    document.getElementById("comments-list").innerHTML = "<p>Failed to fetch comments.</p>";
  }
}
//submit comment
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
// Like functionality
document.getElementById("like-section").addEventListener("click", async () => {
  try {
    const res = await fetch(`/api/projects/${projectId}/like`, {
      method: "POST",
      headers: { 'Content-type': 'application/json' },
      credentials: 'include'
    });

    const data = await res.json();
    document.getElementById("like-count").textContent = data.newLikeCount;
    document.getElementById("like-status").textContent = data.status === "liked" ? "❤️ Liked" : "🤍 Like";
  } catch (err) {
    alert("Something went wrong.");
  }
});

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

document.addEventListener('DOMContentLoaded', () => {
  loadProjectData();
  loadTeam();
  loadComments();
});
