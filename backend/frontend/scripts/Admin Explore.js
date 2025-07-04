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
  fetch('/admin/categories')
    .then(res => res.json())
    .then(data => {
      categoryList.innerHTML = '';

      // Create 'All' category option
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

      // Create category items
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

      // Initial fetch
      fetchProjects();
    });
}

// ==========================
// ✅ Fetch and display projects with current filters
// ==========================
function fetchProjects(searchTerm = '') {
 let endpoint = '';

if (currentSort === 'pending') {
  endpoint = '/admin/projects?sort=pending';
} else {
  endpoint = currentCategory
    ? `/admin/projects/by-category?category=${encodeURIComponent(currentCategory)}&sort=${currentSort}`
    : `/admin/projects?sort=${currentSort}`;
}

  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      const term = searchTerm.toLowerCase();

      // Filter by title or author
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
          <button class="view-button" data-id="${project.id}">View Details</button>
        `;

        const button = card.querySelector('.view-button');
        button.addEventListener('click', () => {
          const type = (project.project_type || '').toLowerCase().trim();
          const file = type === 'it' ? 'adminitview' : 'adminnonitview';
          window.location.href = `/${file}?projectId=${button.dataset.id}`;
        });

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
// ✅ Handle search bar input
// ==========================
searchBar.addEventListener('input', (e) => {
  currentSearchTerm = e.target.value.trim();
  fetchProjects(currentSearchTerm);
});

// ==========================
// ✅ Initial category load on page start
// ==========================
fetchCategories();

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


// ==========================
// ✅ Attach modal confirm/cancel buttons on DOM load
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

  if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', logout);
  if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', closeLogoutConfirm);
});
