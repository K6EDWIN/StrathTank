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
