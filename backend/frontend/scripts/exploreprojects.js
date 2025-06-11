const categoryList = document.getElementById('category-list');
const sortOptions = document.getElementById('sort-options');
const projectGrid = document.getElementById('project-grid');

let currentCategory = '';
let currentSort = 'newest';

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
          fetchProjects();
        });
        categoryList.appendChild(li);
      });

      // Fetch all projects initially
      fetchProjects();
    });
}

function fetchProjects() {
  let endpoint = '';

  if (currentCategory) {
    endpoint = `/api/projects/by-category?category=${encodeURIComponent(currentCategory)}&sort=${currentSort}`;
  } else {
    endpoint = `/api/projects`; // ← Your existing API for all projects
  }

  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      projectGrid.innerHTML = '';
      data.forEach(project => {
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

sortOptions.addEventListener('change', () => {
  currentSort = sortOptions.value;
  fetchProjects();
});

// Initial load
fetchCategories();
