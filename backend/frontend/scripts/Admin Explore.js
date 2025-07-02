// ==========================
// ✅ DOM elements references
// ==========================
const categoryList = document.getElementById('category-list');
const sortOptions = document.getElementById('sort-options');
const projectGrid = document.getElementById('project-grid');
const searchBar = document.getElementById('searchBar');

// ==========================
// ✅ State variables to track filters
// ==========================
let currentCategory = '';
let currentSort = 'newest';
let currentSearchTerm = '';

// ==========================
// ✅ Fetch and display all categories
// ==========================
function fetchCategories() {
  fetch('/api/categories')
    .then(res => res.json())
    .then(data => {
      categoryList.innerHTML = '';

      // Create 'All' category option
      const allLi = document.createElement('li');
      allLi.textContent = 'All';
      allLi.classList.add('selected');
      allLi.addEventListener('click', () => {
        // Clear selection and reset filter
        document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('selected'));
        allLi.classList.add('selected');
        currentCategory = '';
        fetchProjects(currentSearchTerm);
      });
      categoryList.appendChild(allLi);

      // Create list items for each category
      data.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat.category;
        li.addEventListener('click', () => {
          // Update selection and filter by category
          document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('selected'));
          li.classList.add('selected');
          currentCategory = cat.category;
          fetchProjects(currentSearchTerm);
        });
        categoryList.appendChild(li);
      });

      // Initial fetch of projects after loading categories
      fetchProjects();
    });
}

// ==========================
// ✅ Fetch and display projects with current filters
// @param {string} searchTerm - Term to filter projects by title/author
// ==========================
function fetchProjects(searchTerm = '') {
  let endpoint = '';

  // Choose API endpoint based on selected category
  if (currentCategory) {
    endpoint = `/api/projects/by-category?category=${encodeURIComponent(currentCategory)}&sort=${currentSort}`;
  } else {
    endpoint = `/api/projects?sort=${currentSort}`;
  }

  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      const term = searchTerm.toLowerCase();

      // Filter projects by search term matching title or author
      const filtered = data.filter(project => {
        return (
          project.title.toLowerCase().includes(term) ||
          (project.author && project.author.toLowerCase().includes(term))
        );
      });

      // Clear project grid before rendering
      projectGrid.innerHTML = '';

      // Create project cards for each filtered project
      filtered.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';

        // Append project image if available
        if (project.image) {
          const img = document.createElement('img');
          img.src = project.image;
          img.alt = project.title;
          img.style.width = '100%';
          img.style.borderRadius = '4px';
          card.appendChild(img);
        }

        // Add project info and action button
        card.innerHTML += `
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="interactions">
            <span>👍 ${project.likes}</span>
            <span>💬 ${project.comments}</span>
          </div>
          <button class="view-button" data-id="${project.id}">View Details</button>
        `;

        // Add click listener to the view button for navigation based on project type
        const button = card.querySelector('.view-button');
        button.addEventListener('click', () => {
          const type = (project.project_type || '').toLowerCase().trim();
          const file = type === 'it' ? 'project-view' : 'individualProjectsViewnonIT';
          window.location.href = `/${file}?projectId=${button.dataset.id}`;
        });

        // Append the card to the grid
        projectGrid.appendChild(card);
      });
    });
}

// ==========================
// ✅ Handle sorting option change
// ==========================
sortOptions.addEventListener('change', () => {
  currentSort = sortOptions.value;
  fetchProjects(currentSearchTerm);
});

// ==========================
// ✅ Handle search bar input for live filtering
// ==========================
searchBar.addEventListener('input', (e) => {
  currentSearchTerm = e.target.value.trim();
  fetchProjects(currentSearchTerm);
});

// ==========================
// ✅ Initial category load on page start
// ==========================
fetchCategories();

// ==========================
// ✅ Logout user with loader and redirect handling
// ==========================
function logoutUser() {
  // Show logout loader
  const loader = document.getElementById('logout-loader');
  loader.style.display = 'flex';

  // Optional delay for better UX (e.g., 1.5 seconds)
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
        console.error('[LOGOUT USER] Error:', err);
        alert('Error logging out.');
      });
  }, 1500); // Show loader before logging out
}
