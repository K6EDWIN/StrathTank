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
      const allLi = document.createElement('li');
      allLi.textContent = 'All';
      allLi.classList.add('selected'); 
      allLi.addEventListener('click', () => {
        document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('selected'));
        allLi.classList.add('selected');
        currentCategory = ''; 
        fetchProjects(currentSearchTerm);
      });
      categoryList.appendChild(allLi);

      data.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat.category;
        li.addEventListener('click', () => {
          document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('selected'));
          li.classList.add('selected');
          currentCategory = cat.category;
          fetchProjects(currentSearchTerm);
        });
        categoryList.appendChild(li);
      });

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
      const term = searchTerm.toLowerCase();

      const filtered = data.filter(project => {
        return (
          project.title.toLowerCase().includes(term) ||
          (project.author && project.author.toLowerCase().includes(term))
        );
      });

      projectGrid.innerHTML = '';

      filtered.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';

        if (project.image) {
          const img = document.createElement('img');
          img.src = project.image ;
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
          <button class="view-button" data-id="${project.id}">View Details</button>
        `;

       const button = card.querySelector('.view-button');
   button.addEventListener('click', () => {
  const type = (project.project_type || '').toLowerCase().trim();

  const file = type === 'it'
    ? 'project-view'
    : 'individualProjectsViewnonIT';

  window.location.href = `/${file}?projectId=${button.dataset.id}`;
});


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
