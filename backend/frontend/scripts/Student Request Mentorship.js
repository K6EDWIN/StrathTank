document.addEventListener("DOMContentLoaded", async () => {
  const projectSelect = document.getElementById("project-id");
  const form = document.querySelector(".mentorship-form");

  // ===============================
  // 1. Fetch Current Logged-in User
  // ===============================
  let userId = null;
  try {
    const userRes = await fetch("/api/user");
    const userData = await userRes.json();

    if (!userData.success || !userData.user?.id) {
      alert("Please log in to submit a mentorship request.");
      return;
    }

    userId = userData.user.id;
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    alert("⚠️ Failed to verify login status.");
    return;
  }

  // ===========================================
  // 2. Fetch Projects (Owned & Collaborations)
  // ===========================================
  try {
    const projectsRes = await fetch(`/api/mentorship/projects/for-mentorship/${userId}`);
    const projects = await projectsRes.json();

    const ownedOptGroup = document.createElement("optgroup");
    ownedOptGroup.label = "Your Projects";

    const collabOptGroup = document.createElement("optgroup");
    collabOptGroup.label = "Collaborated Projects";

    if (!Array.isArray(projects) || projects.length === 0) {
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

      if (ownedOptGroup.children.length) projectSelect.appendChild(ownedOptGroup);
      if (collabOptGroup.children.length) projectSelect.appendChild(collabOptGroup);
    }
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    alert("⚠️ Could not load your projects.");
  }

  // ======================
  // 3. Handle Form Submit
  // ======================
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    // Sanitize comma-separated fields
    ['skills_expertise', 'availability', 'primary_area'].forEach(key => {
      if (payload[key]) {
        payload[key] = payload[key]
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .join(',');
      }
    });

    try {
      const res = await fetch("/api/mentorship/mentorship-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.requestId) {
        const assignRes = await fetch(`/api/mentorship/auto-assign/${data.requestId}`, {
          method: "POST"
        });

        const assignData = await assignRes.json();
        if (assignRes.ok && assignData.success) {
          showSuccessPopup(assignData.mentor);
        } else {
          alert("Mentorship request submitted, but mentor assignment failed.");
        }

        form.reset();
      } else {
        alert("⚠️ " + (data.error || "Something went wrong."));
      }
    } catch (err) {
      console.error("❌ Error submitting request:", err);
      alert("⚠️ Could not submit mentorship request.");
    }
  });

  // ======================
  // 4. Logout Modal Events
  // ======================
  document.getElementById('confirmLogoutBtn')?.addEventListener('click', logout);
  document.getElementById('cancelLogoutBtn')?.addEventListener('click', closeLogoutConfirm);
});

// ============================
// Success Modal Popup
// ============================
function showSuccessPopup(mentor = null) {
  const modal = document.createElement("div");
  modal.classList.add("popup-modal");

  modal.innerHTML = `
    <div class="popup-content">
      <h2>✅ Mentorship Request Submitted!</h2>
      ${
        mentor
          ? `<p>Your assigned mentor is <strong>${mentor.name}</strong> (${mentor.email}).</p>`
          : `<p>Your request has been submitted.</p>`
      }
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

// ============================
// Logout Flow with Spinner
// ============================
function openLogoutConfirm() {
  document.getElementById('logout-confirm-modal')?.style.setProperty('display', 'flex');
}

function closeLogoutConfirm() {
  document.getElementById('logout-confirm-modal')?.style.setProperty('display', 'none');
}

function showLogoutLoader() {
  document.getElementById('logout-loader')?.style.setProperty('display', 'flex');
}

function hideLogoutLoader() {
  document.getElementById('logout-loader')?.style.setProperty('display', 'none');
}

function logout() {
  closeLogoutConfirm();
  showLogoutLoader();

  const delay = new Promise(resolve => setTimeout(resolve, 1500));
  const logoutReq = fetch('/user/logout', {
    method: 'GET',
    credentials: 'include'
  });

  Promise.all([delay, logoutReq])
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
