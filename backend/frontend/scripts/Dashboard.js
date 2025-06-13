async function loadProjects() {
    try {
        const response = await fetch('/api/projects');

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const projects = await response.json();
        renderProjects(projects);
    } catch (err) {
        console.error('❌ Failed to load projects:', err);
    }
}

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

if (!userHasProjects) {
emptyState.style.display = 'block';
} else {
emptyState.style.display = 'none';
 }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <img src="${project.image || '#'}" alt="Project Image" />
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

window.addEventListener('DOMContentLoaded', loadProjects);


  let lastScrollTop = 0;

  window.addEventListener('scroll', function () {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) { // Adjust threshold as needed
      document.querySelector('.sidebar').classList.add('visible');
      document.body.classList.add('sidebar-visible');
    } else {
      document.querySelector('.sidebar').classList.remove('visible');
      document.body.classList.remove('sidebar-visible');
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });


     document.addEventListener("DOMContentLoaded", async () => {
      try {
        const res = await fetch('/api/user');
        const data = await res.json();

        if (data.success) {
          const userName = data.user.name;
          document.getElementById('welcome-text').textContent = `Welcome, ${userName}!`;
        } else {
          document.getElementById('welcome-text').textContent = 'Welcome, Guest!';
        }
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    });
    
  
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
    spinner.style.display = "block";
    resultsContainer.innerHTML = "";

    debounceTimeout = setTimeout(() => {
      fetch(`/api/homepageprojects?q=${encodeURIComponent(query)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          spinner.style.display = "none";
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
              window.location.href = `/project/${project.id}`; // You can adjust this
            });
            resultsContainer.appendChild(item);
          });
        })
        .catch(err => {
          console.error("Search error:", err);
          spinner.style.display = "none";
        });
    }, 400); // debounce delay
  });

  // Optional: hide dropdown when input loses focus
  searchBar.addEventListener("blur", () => {
    setTimeout(() => dropdown.style.display = "none", 200); // small delay to allow click
  });

  searchBar.addEventListener("focus", () => {
    if (searchBar.value.trim()) dropdown.style.display = "block";
  });
