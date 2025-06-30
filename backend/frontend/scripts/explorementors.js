const categoryList = document.getElementById('category-list');
const sortOptions = document.getElementById('sort-options');
const projectGrid = document.getElementById('project-grid');
const searchBar = document.getElementById('searchBar');

let currentCategory = '';
let currentSort = 'default';
let currentSearchTerm = '';

// Load categories from API
function loadCategories() {
  fetch('/api/categories')
    .then(res => res.json())
    .then(categories => {
      renderCategoryList(categories);
      loadProjects();
    })
    .catch(err => {
      console.error('Failed to load categories:', err);
      categoryList.innerHTML = '<li class="error">Error loading categories</li>';
    });
}

// Render categories in sidebar
function renderCategoryList(categories) {
  categoryList.innerHTML = '';

  const allLi = document.createElement('li');
  allLi.textContent = 'All';
  allLi.classList.add('selected');
  allLi.addEventListener('click', () => selectCategory(''));
  categoryList.appendChild(allLi);

  categories.forEach(cat => {
    const li = document.createElement('li');
    li.textContent = cat.category;
    li.addEventListener('click', () => selectCategory(cat.category));
    categoryList.appendChild(li);
  });
}

// Handle category selection
function selectCategory(category) {
  document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('selected'));
  [...categoryList.children].find(li => li.textContent === (category || 'All')).classList.add('selected');
  currentCategory = category;
  loadProjects(currentSearchTerm);
}

// Load projects from API
function loadProjects(searchTerm = '') {
  let url;
  if (currentCategory) {
    url = `/api/projects/by-category?category=${encodeURIComponent(currentCategory)}&sort=${currentSort}`;
  } else {
    url = `/api/projects?sort=${currentSort}`;
  }

  fetch(url)
    .then(res => res.json())
    .then(projects => {
      const filtered = filterProjects(projects, searchTerm);
      renderProjectGrid(filtered);
    })
    .catch(err => {
      console.error('Failed to load projects:', err);
      projectGrid.innerHTML = '<p class="error">Error loading projects</p>';
    });
}

// Filter projects by search
function filterProjects(projects, searchTerm) {
  const term = searchTerm.toLowerCase();
  return projects.filter(project =>
    project.title.toLowerCase().includes(term) ||
    (project.author && project.author.toLowerCase().includes(term))
  );
}

// Render projects grid
function renderProjectGrid(projects) {
  projectGrid.innerHTML = '';

  if (!projects.length) {
    projectGrid.innerHTML = '<p>No projects found.</p>';
    return;
  }

  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';

    if (project.image) {
      const img = document.createElement('img');
      img.src = project.image;
      img.alt = project.title;
      img.classList.add('project-img');
      card.appendChild(img);
    }

    const title = document.createElement('h3');
    title.textContent = project.title;
    card.appendChild(title);

    const description = document.createElement('p');
    description.textContent = project.description;
    card.appendChild(description);

    const interactions = document.createElement('div');
    interactions.className = 'interactions';
    interactions.innerHTML = `
      <span>👍 ${project.likes}</span>
      <span>💬 ${project.comments}</span>
    `;
    card.appendChild(interactions);

    const button = document.createElement('button');
    button.className = 'view-button';
    button.textContent = 'View Details';
    button.addEventListener('click', () => {
      const type = (project.project_type || '').toLowerCase().trim();
      const page = type === 'it' ? 'mentorviewit' : 'mentornonit';
      window.location.href = `/${page}?projectId=${project.id}`;
    });
    card.appendChild(button);

    projectGrid.appendChild(card);
  });
}

// Event listeners
sortOptions.addEventListener('change', () => {
  currentSort = sortOptions.value;
  loadProjects(currentSearchTerm);
});

searchBar.addEventListener('input', e => {
  currentSearchTerm = e.target.value.trim();
  loadProjects(currentSearchTerm);
});

// Initialize
loadCategories();
