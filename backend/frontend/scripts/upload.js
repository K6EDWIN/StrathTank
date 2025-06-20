// === Inject user_id from session (Ensure this is injected in HTML too) ===
let sessionUserId = window.currentUserId || null;

// === Toggle IT-specific fields ===
function toggleITFields(checkbox) {
  const itFields = document.getElementById('itFields');
  const nonItFields = document.getElementById('nonItFields');
  itFields.style.display = checkbox.checked ? 'block' : 'none';
  nonItFields.style.display = checkbox.checked ? 'none' : 'block';
}

// === Add additional team member input ===
function addTeamMemberInput() {
  const container = document.getElementById('teamMembers');
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'e.g., New Team Member';
  container.appendChild(input);
}

// === Show and smoothly fade the thumbs-up GIF ===
function showAndHideThumbsGif() {
  const gif = document.getElementById("thumbsGif");
  gif.style.display = "flex";
  gif.style.opacity = "1";
  gif.classList.remove("fade-out");

  setTimeout(() => gif.classList.add("fade-out"), 1000); // start fading
  setTimeout(() => gif.style.display = "none", 3000);    // hide after fade
}

// === Get all form data ===
function getFormData() {
  const isIT = document.getElementById("isITProject").checked;
  const teamInputs = document.querySelectorAll("#teamMembers input");
  const tags = document.getElementById("tags").value;

  const techOrNonITFields = isIT
    ? {
        technical_details: [
          document.querySelector('#itFields input[placeholder*="Programming"]')?.value,
          document.querySelector('#itFields input[placeholder*="Framework"]')?.value,
          document.querySelector('#itFields input[placeholder*="Database"]')?.value,
          document.querySelector('#itFields input[placeholder*="Deployment"]')?.value
        ].filter(Boolean).join(" | ")
      }
    : {
        focus: document.getElementById("focus")?.value,
        methodology: document.getElementById("methodology")?.value,
        beneficiaries: document.getElementById("beneficiaries")?.value,
        goals: document.getElementById("goals")?.value
      };

  return {
    user_id: sessionUserId,
    title: document.getElementById("title").value,
    short_description: document.getElementById("shortDesc").value,
    project_lead: document.getElementById("lead").value,
    description: document.getElementById("abstract").value,
    project_type: isIT ? "it" : "non-it",
    tags,
    team_size: teamInputs.length,
    launch_date: document.getElementById("launchDate").value,
    status: "pending",
    ...techOrNonITFields
  };
}

// === Send project to backend ===
async function submitProjectToServer(formData) {
  try {
    const res = await fetch("/user/upload-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    return res.ok;
  } catch (err) {
    console.error("Error sending project:", err);
    return false;
  }
}

// === Handle project upload with thumbs animation ===
async function handleProjectUpload(e, isDraft = false) {
  e.preventDefault();
  showAndHideThumbsGif();

  const data = getFormData();
  data.status = "pending"; // always mark as pending

  const success = await submitProjectToServer(data);
  if (success) {
    console.log("✅ Project submitted successfully.");
  } else {
    alert("⚠️ Failed to submit project. Please try again.");
  }
}

// === Attach events once DOM is ready ===
document.addEventListener("DOMContentLoaded", () => {
  sessionUserId = window.currentUserId || null;

  document.querySelector(".draft")?.addEventListener("click", (e) =>
    handleProjectUpload(e, true)
  );
  document.querySelector(".submit")?.addEventListener("click", (e) =>
    handleProjectUpload(e, false)
  );
});
