// Load all projects and render them
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

// Render user and recent projects
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

// Generate HTML structure for a single project
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

// Show user welcome name
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

// Search functionality
const searchBar = document.getElementById("searchBar");
const spinner = document.getElementById("spinner");
const resultsContainer = document.getElementById("search-results");
const dropdown = document.getElementById("search-dropdown");
let debounceTimeout;

searchBar.addEventListener("input", () => {
  const query = searchBar.value.trim();
  clearTimeout(debounceTimeout);

  if (!query) {
    dropdown.style.display = "none";
    return;
  }

  dropdown.style.display = "block";
  spinner && (spinner.style.display = "block");
  resultsContainer.innerHTML = "";

  debounceTimeout = setTimeout(() => {
    fetch(`/api/searchprojects?q=${encodeURIComponent(query)}&limit=5`)
      .then(res => res.json())
      .then(data => {
        spinner && (spinner.style.display = "none");
        resultsContainer.innerHTML = "";

        if (!data || data.length === 0) {
          const noResult = document.createElement("div");
          noResult.className = "dropdown-item";
          noResult.innerText = "No results found.";
          resultsContainer.appendChild(noResult);
          return;
        }

        data.forEach(project => {
          const item = document.createElement("div");
          item.className = "dropdown-item";
          item.innerHTML = `<strong>${project.title}</strong>`;
          item.addEventListener("click", () => {
            window.location.href = `/project/${project.id}`;
          });
          resultsContainer.appendChild(item);
        });
      })
      .catch(err => {
        console.error("Search error:", err);
        spinner && (spinner.style.display = "none");
      });
  }, 400);
});

searchBar.addEventListener("blur", () => {
  setTimeout(() => dropdown.style.display = "none", 200);
});
searchBar.addEventListener("focus", () => {
  if (searchBar.value.trim()) dropdown.style.display = "block";
});

// Sidebar toggle on scroll
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
});

// Explore button functionality
document.addEventListener("DOMContentLoaded", () => {
  const exploreBtn = document.getElementById("explore-btn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      window.location.href = "/explore-projects";
    });
  }
});

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
  loadUserInfo();
});



function loginUser(event) {
  event.preventDefault(); // prevent default form submission if using a form

  const loader = document.getElementById('login-loader');
  loader.style.display = 'flex'; // show spinner

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



function logoutUser() {
  // Show logout loader
  const loader = document.getElementById('logout-loader');
  loader.style.display = 'flex';

  // Optional delay for UX (e.g. 1.5 seconds)
  setTimeout(() => {
    fetch('/user/logout', {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => {
        if (res.redirected) {
          window.location.href = res.url;
        } else {
          loader.style.display = 'none'; // hide loader
          alert('Logout failed.');
        }
      })
      .catch(err => {
        loader.style.display = 'none'; // hide loader
        console.error('Logout error:', err);
        alert('Error logging out.');
      });
  }, 1500); // Show loader before logging out
}

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const closeButton = document.getElementById('sidebarClose');

  closeButton.addEventListener('click', () => {
    sidebar.classList.remove('visible');
  });
});

