const params = new URLSearchParams(window.location.search);
const projectId = params.get("projectId");

async function loadProjectData() {
  const projectRes = await fetch(`/api/projects/${projectId}/details`);
  const project = await projectRes.json();

  // ✅ Set hero background image from file_path
 const heroSection = document.querySelector(".hero");
heroSection.style.backgroundImage = `url('/${project.file_path}')`;



  // ✅ Basic Info
  document.getElementById("project-title").textContent = project.title;
  document.getElementById("project-short-description").textContent = project.short_description;
  document.getElementById("project-overview").textContent = project.overview;

  // ✅ Tags
  const tagContainer = document.getElementById("tag-container");
  tagContainer.innerHTML = '';
  project.tags.forEach(tag => {
    const span = document.createElement("span");
    span.textContent = tag;
    tagContainer.appendChild(span);
  });

  // ✅ Technical Details
const techList = document.getElementById("technical-details");
techList.innerHTML = ''; // Clear previous content

const techDetails = project.technical_details;

// Match only the known headings followed by colon
const headings = ['Programming', 'Frameworks', 'Database', 'Deployment'];
const sections = techDetails.split(new RegExp(`(?=${headings.join('|')}:)`, 'g'));

sections.forEach(section => {
  const [heading, content] = section.split(":");
  if (heading && content) {
    // Split content by full stops or commas
    const lines = content.split(/[\.,]/).map(s => s.trim()).filter(line => line.length > 0);
    techList.innerHTML += `
      <li><strong>${heading.trim()}:</strong><br/>${lines.join("<br/>")}</li>
    `;
  }
});


  // ✅ Project Info
  const infoList = document.getElementById("project-info");
  infoList.innerHTML = `
    <li><strong>Status:</strong> ${project.status}</li>
    <li><strong>Launch Date:</strong> ${project.launch_date}</li>
    <li><strong>Project Lead:</strong> ${project.project_lead}</li>
    <li><strong>Team Size:</strong> ${project.team_size}</li>
  `;

  document.getElementById("like-count").textContent = project.likes;

  // ✅ Screenshots
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

  // ✅ Documents
  const docRow = document.getElementById("documents");
  docRow.innerHTML = '';
  project.documents.forEach((doc, i) => {
    docRow.innerHTML += `
      <div class="card">
        <div class="icon">📄</div>
        <div class="doc-info">
          <p>${doc}</p>
          <button>View</button>
        </div>
      </div>
    `;
  });
}
// ✅ Team Members
async function loadTeam() {
  try {
    const res = await fetch(`/api/projects/${projectId}/team`);
    const team = await res.json();

    console.log("🔍 Team data:", team);

    if (!Array.isArray(team)) {
      throw new Error("Team is not an array");
    }

    const teamContainer = document.getElementById("team-members");
    teamContainer.innerHTML = '';

    team.forEach(member => {
      const profileImage = member.profile_photo || '/assets/noprofile.jpg';
      teamContainer.innerHTML += `
        <div class="card">
          <img src="${profileImage}" alt="${member.name}" />
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


// ✅ Comments Section

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

// ✅ Like handler
document.getElementById("like-section").addEventListener("click", async () => {
  const user_id = 1; // TODO: Replace with real logged-in user ID

  try {
    const res = await fetch(`/api/projects/${projectId}/like`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id })
    });

    const data = await res.json();
    if (data.newLikeCount !== undefined) {
      document.getElementById("like-count").textContent = data.newLikeCount;
    }
  } catch (err) {
    alert("Already liked or an error occurred.");
  }
});

// Initial data load
loadProjectData();
loadTeam();




document.addEventListener('DOMContentLoaded', () => {
  loadComments();  // Load comments on page load
});
