const categoryList = document.getElementById('category-list');
const sortOptions = document.getElementById('sort-options');
const projectGrid = document.getElementById('project-grid');
const searchBar = document.getElementById('searchBar');

let currentCategory = '';
let currentSort = 'newest';
let currentSearchTerm = '';

// Fetch and display categories
function fetchCategories() {
  fetch('/api/categories')
    .then(res => res.json())
    .then(data => {
      categoryList.innerHTML = '';
      data.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat.category;
        li.addEventListener('click', () => {
          document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('selected'));
          li.classList.add('selected');
          currentCategory = cat.category;
          fetchProjects(currentSearchTerm);  // include searchTerm when fetching
        });
        categoryList.appendChild(li);
      });

      // Fetch all projects initially
      fetchProjects();
    });
}

// Fetch and display projects based on filters
function fetchProjects(searchTerm = '') {
  let endpoint = '';

  if (currentCategory) {
    endpoint = `/api/projects/by-category?category=${encodeURIComponent(currentCategory)}&sort=${currentSort}`;
  } else {
    endpoint = `/api/projects?sort=${currentSort}`;
  }

  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      // Apply client-side filtering by title or author
      const filtered = data.filter(project => {
        const term = searchTerm.toLowerCase();
        return (
          project.title.toLowerCase().includes(term) ||
          (project.author && project.author.toLowerCase().includes(term))
        );
      });

      // Clear the grid
      projectGrid.innerHTML = '';

      // Render filtered projects
      filtered.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';

        if (project.image) {
          const img = document.createElement('img');
          img.src = project.image;
          img.alt = project.title;
          img.style.width = '100%';
          img.style.borderRadius = '4px';
          card.appendChild(img);
        }

        card.innerHTML += `
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="interactions">
            <span>👍 ${project.likes}</span>
            <span>💬 ${project.comments}</span>
          </div>
          <button>View Details</button>
        `;

        projectGrid.appendChild(card);
      });
    });
}

// Handle sorting change
sortOptions.addEventListener('change', () => {
  currentSort = sortOptions.value;
  fetchProjects(currentSearchTerm);
});

// Handle search input
searchBar.addEventListener('input', (e) => {
  currentSearchTerm = e.target.value.trim();
  fetchProjects(currentSearchTerm);
});

// Initial load
fetchCategories();
