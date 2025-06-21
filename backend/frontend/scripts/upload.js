let sessionUserId = window.currentUserId || null;

function toggleITFields(checkbox) {
  const itFields = document.getElementById('itFields');
  const nonItFields = document.getElementById('nonItFields');
  itFields.style.display = checkbox.checked ? 'block' : 'none';
  nonItFields.style.display = checkbox.checked ? 'none' : 'block';
}

function addTeamMemberInput() {
  const container = document.getElementById('teamMembers');
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'e.g., New Team Member';
  container.appendChild(input);
}

function showAndHideThumbsGif() {
  const gif = document.getElementById("thumbsGif");
  gif.style.display = "flex";
  gif.style.opacity = "1";
  gif.classList.remove("fade-out");
  setTimeout(() => gif.classList.add("fade-out"), 1000);
  setTimeout(() => gif.style.display = "none", 3000);
}

function gatherFormData() {
  const form = new FormData();

  form.append("user_id", sessionUserId);
  form.append("title", document.getElementById("title").value);
  form.append("Short_description", document.getElementById("shortDesc").value);
  form.append("project_lead", document.getElementById("lead").value);
  form.append("description", document.getElementById("abstract").value);
  form.append("tags", document.getElementById("tags").value);
  form.append("launch_date", document.getElementById("launchDate").value);
  form.append("status", "pending");

  const teamInputs = document.querySelectorAll("#teamMembers input");
  form.append("team_size", teamInputs.length);

  // Project type
  const isIT = document.getElementById("isITProject").checked;
  form.append("project_type", isIT ? "it" : "non-it");

  // Category fallback
  form.append("category", "General");

  // Version default
  form.append("version", "1.0");

  // Technical or non-IT details
  if (isIT) {
    const techDetails = [
      document.querySelector('#itFields input[placeholder*="Programming"]')?.value,
      document.querySelector('#itFields input[placeholder*="Framework"]')?.value,
      document.querySelector('#itFields input[placeholder*="Database"]')?.value,
      document.querySelector('#itFields input[placeholder*="Deployment"]')?.value
    ].filter(Boolean).join(" | ");
    form.append("technical_details", techDetails);
  } else {
    const nonItDetails = [
      document.getElementById("focus")?.value,
      document.getElementById("methodology")?.value,
      document.getElementById("beneficiaries")?.value,
      document.getElementById("goals")?.value
    ].filter(Boolean).join(" | ");
    form.append("technical_details", nonItDetails);
  }

  // Files: profile image
  const profileInput = document.querySelector('input[type="file"][name="project_profile_picture"]');
  if (profileInput?.files[0]) {
    form.append("project_profile_picture", profileInput.files[0]);
  }

  // Screenshots (multiple)
  const screenshotsInput = document.querySelector('input[type="file"][name="screenshots[]"]');
  if (screenshotsInput?.files) {
    [...screenshotsInput.files].forEach(file => form.append("screenshots[]", file));
  }

  // Documents (multiple)
  const docsInput = document.querySelector('input[type="file"][name="documents[]"]');
  if (docsInput?.files) {
    [...docsInput.files].forEach(file => form.append("documents[]", file));
  }

  return form;
}

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

document.addEventListener("DOMContentLoaded", () => {
  sessionUserId = window.currentUserId || null;

  document.querySelector(".submit")?.addEventListener("click", submitProject);
  document.querySelector(".draft")?.addEventListener("click", (e) => {
    e.preventDefault();
    alert("📝 Draft saving is not yet implemented.");
  });
});
