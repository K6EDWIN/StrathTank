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

    recentContainer.innerHTML = '';
    userContainer.innerHTML = '';

    projects.forEach(project => {
        const card = createProjectCard(project);
        project.is_owner
            ? userContainer.appendChild(card)
            : recentContainer.appendChild(card);
    });
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
    