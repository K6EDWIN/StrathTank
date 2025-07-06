// ==========================
// STATE
// ==========================
let currentCategory = '';
let currentSort = 'newest';
let currentSearchTerm = '';

// ==========================
// SELECTORS
// ==========================
const categoryList = document.getElementById('category-list');
const sortOptions = document.getElementById('sort-options');
const projectGrid = document.getElementById('project-grid');
const searchBar = document.getElementById('searchBar');

// ==========================
// INITIALIZE
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();

  sortOptions?.addEventListener('change', () => {
    currentSort = sortOptions.value;
    loadProjects(currentSearchTerm);
  });

  searchBar?.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value.trim();
    loadProjects(currentSearchTerm);
  });

  // Logout modal buttons
  document.getElementById('confirmLogoutBtn')?.addEventListener('click', logout);
  document.getElementById('cancelLogoutBtn')?.addEventListener('click', closeLogoutConfirm);
});

// ==========================
// LOAD & RENDER CATEGORIES
// ==========================
function loadCategories() {
  fetch('/api/categories', { credentials: 'include' })
    .then(res => res.json())
    .then(categories => {
      renderCategoryList(categories);
      loadProjects();
    })
    .catch(err => {
      console.error('❌ Failed to load categories:', err);
      categoryList.innerHTML = '<li class="error">Error loading categories</li>';
    });
}

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

function selectCategory(category) {
  document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('selected'));
  [...categoryList.children].find(li => li.textContent === (category || 'All')).classList.add('selected');
  currentCategory = category;
  loadProjects(currentSearchTerm);
}

// ==========================
// LOAD & RENDER PROJECTS
// ==========================
function loadProjects(searchTerm = '') {
  let endpoint = currentCategory
    ? `/api/projects/by-category?category=${encodeURIComponent(currentCategory)}&sort=${currentSort}`
    : `/api/projects?sort=${currentSort}`;

  fetch(endpoint, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      const filtered = filterProjects(data, searchTerm);
      renderProjectGrid(filtered);
    })
    .catch(err => {
      console.error('❌ Failed to load projects:', err);
      projectGrid.innerHTML = '<p class="error">Error loading projects</p>';
    });
}

function filterProjects(projects, searchTerm) {
  const term = searchTerm.toLowerCase();

  return projects.filter(project => {
    const inTitle = project.title?.toLowerCase().includes(term);
    const inAuthor = project.author?.toLowerCase().includes(term);

    let inTags = false;
    if (project.tags && typeof project.tags === 'string') {
    

      // Split  for searching
      const tagArray = project.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      inTags = tagArray.some(tag => tag.includes(term));
    }

    return inTitle || inAuthor || inTags;
  });
}



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
      img.style.width = '100%';
      img.style.borderRadius = '4px';
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
      const page = type === 'it' ? 'project-view' : 'individualProjectsViewnonIT';
      window.location.href = `/${page}?projectId=${project.id}`;
    });
    card.appendChild(button);

    projectGrid.appendChild(card);
  });
}
// =====================================================
// ✅ Logout Flow with Spinner
// =====================================================
function openLogoutConfirm() {
  const modal = document.getElementById('logout-confirm-modal');
  if (modal) modal.style.display = 'flex';
}

function closeLogoutConfirm() {
  const modal = document.getElementById('logout-confirm-modal');
  if (modal) modal.style.display = 'none';
}

function showLogoutLoader() {
  const loader = document.getElementById('logout-loader');
  if (loader) loader.style.display = 'flex';
}

function hideLogoutLoader() {
  const loader = document.getElementById('logout-loader');
  if (loader) loader.style.display = 'none';
}

function logout() {
  closeLogoutConfirm();
  showLogoutLoader();

  const minDelay = new Promise(resolve => setTimeout(resolve, 1500)); 
  const logoutRequest = fetch('/user/logout', {
    method: 'GET',
    credentials: 'include'
  });

  Promise.all([minDelay, logoutRequest])
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