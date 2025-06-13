// Scroll to Projects when Explore arrow is clicked
document.querySelector('.explore').addEventListener('click', function () {
  document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
});

// Automatically scroll to CTA when bottom of Projects is visible
let ctaTriggered = false;

window.addEventListener('scroll', function () {
  if (ctaTriggered) return;

  const projects = document.querySelector('#projects');
  const cta = document.querySelector('#cta');
  const projectsRect = projects.getBoundingClientRect();

  if (projectsRect.bottom <= window.innerHeight + 50) {
    ctaTriggered = true;
    cta.scrollIntoView({ behavior: 'smooth' });
  }
});

// Handle button clicks
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

//fetch projects and display them
let offset = 0;
const limit = 3;
const intervalTime = 5000; // 5 seconds

async function fetchAndDisplayProjects() {
  try {
    const response = await fetch(`/api/homepageprojects?limit=${limit}&offset=${offset}`);
    const data = await response.json();

    const container = document.getElementById('projectCards');
    container.innerHTML = ''; // Clear existing cards

    if (data.length === 0) {
      offset = 0; // Reset if no results (e.g., DB was cleared)
      return;
    }

    data.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="thumb" style="background-image: url('${p.image || ''}'); background-size: cover; background-position: center;"></div>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="meta">Author: ${p.author || 'Unknown'} <button>View</button></div>
      `;
      container.appendChild(card);
    });

    // Update offset for next batch
    if (data.length < limit) {
      offset = 0; // Reset if last page
    } else {
      offset += limit;
    }
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }
}

// Initial load
fetchAndDisplayProjects();

// Rotate projects every 5 seconds
setInterval(fetchAndDisplayProjects, intervalTime);
