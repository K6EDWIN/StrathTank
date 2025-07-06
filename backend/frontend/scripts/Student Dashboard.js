// ========================================
// Load all projects and render them
// ========================================
async function loadProjects() {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    
    const projects = await response.json();
    renderProjects(projects);
  } catch (err) {
    console.error('❌ Failed to load projects:', err);
  }
}

// ========================================
// Render user and recent projects
// ========================================
function renderProjects(projects) {
  const recentContainer = document.querySelector('#recent-projects');
  const userContainer = document.querySelector('#user-projects');
  const emptyState = document.querySelector('#no-projects-message'); 

  recentContainer.innerHTML = '';
  userContainer.innerHTML = '';

  let userHasProjects = false;

  projects.forEach(project => {
    const card = createProjectCard(project);
    if (project.is_owner) {
      userHasProjects = true;
      userContainer.appendChild(card);
    } else {
      recentContainer.appendChild(card);
    }
  });

  emptyState.style.display = userHasProjects ? 'none' : 'block';
}

// ========================================
// Generate HTML structure for a single project
// ========================================
function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${project.image || '/assets/placeholder.jpg'}" alt="Project Image" />
    <h3>${project.title}</h3>
    <p>${project.description}</p>
    <div class="meta">
      ${project.category} | ${new Date(project.created_at).toLocaleDateString()}
    </div>
    <div class="interactions">
      <span>❤️ ${project.likes}</span>
      <span>💬 ${project.comments}</span>
    </div>
  `;
  return card;
}

// ========================================
// Show user welcome name
// ========================================
async function loadUserInfo() {
  try {
    const res = await fetch('/api/user');
    const data = await res.json();
    const welcomeText = document.getElementById('welcome-text');

    if (data.success) {
      welcomeText.textContent = `Welcome, ${data.user.name}!`;
    } else {
      welcomeText.textContent = 'Welcome, Guest!';
    }
  } catch (err) {
    console.error('Failed to fetch user info:', err);
  }
}

// ========================================
// Sidebar toggle on scroll
// ========================================
/*
let lastScrollTop = 0;
window.addEventListener('scroll', function () {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > 100) {
    document.querySelector('.sidebar').classList.add('visible');
    document.body.classList.add('sidebar-visible');
  } else {
    document.querySelector('.sidebar').classList.remove('visible');
    document.body.classList.remove('sidebar-visible');
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});*/

// ========================================
// Explore button functionality
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  const exploreBtn = document.getElementById("explore-btn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      window.location.href = "/explore-projects";
    });
  }
});

// ========================================
// Initialize dashboard
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
  loadUserInfo();
});

// ========================================
// Login function (unchanged)
// ========================================
function loginUser(event) {
  event.preventDefault();

  const loader = document.getElementById('login-loader');
  loader.style.display = 'flex';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('/user/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then(res => {
      if (res.redirected) {
        window.location.href = res.url;
      } else {
        loader.style.display = 'none';
        alert('Login failed. Please check your credentials.');
      }
    })
    .catch(err => {
      loader.style.display = 'none';
      console.error('Login error:', err);
      alert('An error occurred during login.');
    });
}

// ========================================
// Function to show the logout confirmation modal
// ========================================
function openLogoutConfirm() {
  const modal = document.getElementById('logout-confirm-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// ========================================
// Function to actually log out
// ========================================
function logoutUser() {
  const loader = document.getElementById('logout-loader');
  if (loader) {
    loader.style.display = 'flex';
  }

  fetch('/user/logout', {
    method: 'GET',
    credentials: 'include'
  })
  .then(res => {
    if (res.redirected) {
      window.location.href = res.url;
    } else {
      if (loader) loader.style.display = 'none';
      alert('Logout failed.');
    }
  })
  .catch(err => {
    if (loader) loader.style.display = 'none';
    console.error('Logout error:', err);
    alert('Error logging out.');
  });
}

// ========================================
// Sidebar close button
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const closeButton = document.getElementById('sidebarClose');

  if (closeButton && sidebar) {
    closeButton.addEventListener('click', () => {
      sidebar.classList.remove('visible');
    });
  }
});

// ========================================
// Handle Logout Confirmation Modal
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  const confirmBtn = document.getElementById('confirmLogoutBtn');
  const cancelBtn = document.getElementById('cancelLogoutBtn');
  const modal = document.getElementById('logout-confirm-modal');

  if (confirmBtn && cancelBtn && modal) {
    confirmBtn.addEventListener('click', () => {
      // Close confirmation modal first
      modal.style.display = 'none';

      // Show spinner immediately and perform logout
      logoutUser();
    });

    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
});
// ========================================
// Handle Hamburger Toggle for Sidebar (Mobile)
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');
  const closeButton = document.getElementById('sidebarClose');

  // Hamburger button toggles sidebar
  if (hamburgerBtn && sidebar) {
    hamburgerBtn.addEventListener('click', () => {
      sidebar.classList.toggle('visible');
      document.body.classList.toggle('sidebar-visible');
    });
  }

  // Sidebar close button
  if (closeButton && sidebar) {
    closeButton.addEventListener('click', () => {
      sidebar.classList.remove('visible');
      document.body.classList.remove('sidebar-visible');
    });
  }
});

