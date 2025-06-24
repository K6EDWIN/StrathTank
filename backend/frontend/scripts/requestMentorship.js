document.addEventListener("DOMContentLoaded", async () => {
  const projectSelect = document.getElementById("project-id");

  // 1. Get current user
  let userId = null;
  try {
    const userRes = await fetch("/api/user");
    const userData = await userRes.json();

    if (!userData.success) {
      alert("Please log in to submit a mentorship request.");
      return;
    }

    userId = userData.user.id;
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    return;
  }

  // 2. Get both owned and collaborated projects
  try {
    const projectsRes = await fetch(`/api/mentorship/projects/for-mentorship/${userId}`);
    const projects = await projectsRes.json();

    const ownedOptGroup = document.createElement("optgroup");
    ownedOptGroup.label = "Your Projects";

    const collabOptGroup = document.createElement("optgroup");
    collabOptGroup.label = "Collaborated Projects";

    if (projects.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "You have no projects yet";
      option.disabled = true;
      option.selected = true;
      projectSelect.appendChild(option);
    } else {
      projects.forEach(project => {
        const option = document.createElement("option");
        option.value = project.id;
        option.textContent = project.title;

        if (project.relationship === "owned") {
          ownedOptGroup.appendChild(option);
        } else {
          collabOptGroup.appendChild(option);
        }
      });

      if (ownedOptGroup.children.length > 0) projectSelect.appendChild(ownedOptGroup);
      if (collabOptGroup.children.length > 0) projectSelect.appendChild(collabOptGroup);
    }
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
  }

  // 3. Form submission
  const form = document.querySelector(".mentorship-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/mentorship/mentorship-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showSuccessPopup();
        form.reset();
      } else {
        alert("⚠️ " + (data.error || "Something went wrong."));
      }
    } catch (err) {
      console.error("❌ Error submitting request:", err);
    }
  });
});

function showSuccessPopup() {
  const modal = document.createElement("div");
  modal.classList.add("popup-modal");
  modal.innerHTML = `
    <div class="popup-content">
      <h2>✅ Mentorship Request Submitted!</h2>
      <p>Would you like to submit another request or go to your dashboard?</p>
      <div class="popup-actions">
        <button id="submit-another" class="popup-btn">Submit Another</button>
        <button id="go-dashboard" class="popup-btn alt">Go to Dashboard</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("submit-another").onclick = () => {
    modal.remove();
    document.querySelector(".mentorship-form").scrollIntoView({ behavior: "smooth" });
  };

  document.getElementById("go-dashboard").onclick = () => {
    window.location.href = "/dashboard";
  };
}
