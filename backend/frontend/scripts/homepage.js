// ==========================
// ✅ Scroll to Projects when Explore arrow is clicked
// ==========================
document.querySelector('.explore').addEventListener('click', function () {
  document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
});

// ==========================
// ✅ Smooth scroll from #projects to #cta when #projects is mostly visible
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  const cta = document.querySelector('#cta');
  const projects = document.querySelector('#projects');

  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting) {
        setTimeout(() => {
          cta.scrollIntoView({ behavior: 'smooth' });
        }, 5000); // small delay for natural feel
        observer.disconnect(); // only scroll once
      }
    },
    {
      threshold: 0.9 // trigger when 90% of projects is visible
    }
  );

  observer.observe(projects);
});

// ==========================
// ✅ Handle button clicks for signin/signup (top and bottom buttons)
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  // Top buttons
  document.getElementById("signinbtn").addEventListener("click", function () {
    window.location.href = "/login";
  });

  document.getElementById("signupbtn").addEventListener("click", function () {
    window.location.href = "/signup";
  });

  // Bottom buttons
  document.getElementById("signinbtnbottom").addEventListener("click", function () {
    window.location.href = "/login";
  });

  document.getElementById("signupbtnbottom").addEventListener("click", function () {
    window.location.href = "/signup";
  });
});

// ==========================
// ✅ Fetch projects and display them with pagination and rotation
// ==========================
let offset = 0;
const limit = 3;
const intervalTime = 5000;

async function fetchAndDisplayProjects() {
  try {
    const response = await fetch(`/api/homepageprojects?limit=${limit}&offset=${offset}`);
    const data = await response.json();

    const container = document.getElementById('projectCards');
    container.innerHTML = ''; // Clear existing cards

    if (data.length === 0) {
      offset = 0; // Reset offset if no more results
      return;
    }

    data.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <img class="thumb" src="${p.image || '/assets/placeholder.jpg'}" alt="${p.title}" onerror="this.src='/assets/placeholder.jpg'" loading="lazy" />
        <div class="card-body">
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <div class="meta">
            <span>By ${p.author || 'Unknown'}</span>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    // Update offset for next batch
    if (data.length < limit) {
      offset = 0;
    } else {
      offset += limit;
    }
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }
}

// Initial load of projects
fetchAndDisplayProjects();

// Rotate projects every 5 seconds
setInterval(fetchAndDisplayProjects, intervalTime);

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-active');
  });
});
