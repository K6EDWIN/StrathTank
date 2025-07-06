// ==========================
// STATE
// ==========================
let currentRequestId = null;

// ==========================
// SELECTORS
// ==========================
const requestListContainer = document.getElementById('request-list');
const chatSection = document.querySelector('.chat-section');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

// ==========================
// INITIALIZE
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  loadRequests();

  // Logout modal buttons
  document.getElementById('confirmLogoutBtn')?.addEventListener('click', logout);
  document.getElementById('cancelLogoutBtn')?.addEventListener('click', closeLogoutConfirm);
});

// ==========================
// LOAD ALL ASSIGNED REQUESTS
// ==========================
function loadRequests() {
  fetch('/api/mentor/requests', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error('Failed to load requests');
      renderRequestList(data.requests);
    })
    .catch(err => {
      console.error('❌ Error loading requests:', err);
      requestListContainer.innerHTML = '<p class="error">Error loading requests.</p>';
    });
}

// ==========================
// RENDER REQUEST LIST
// ==========================
function renderRequestList(requests) {
  requestListContainer.innerHTML = '';

  if (!requests.length) {
    requestListContainer.innerHTML = '<p>No assigned requests.</p>';
    return;
  }

  requests.forEach(req => {
    const card = document.createElement('div');
    card.className = 'request-card';
    card.setAttribute('data-id', req.id);

    card.innerHTML = `
      <div class="request-info">
        <h4 class="request-title">${req.project_title || '(No Project Title)'}</h4>
        <p class="request-subject">${req.subject}</p>
      </div>
      <button class="select-request-btn">Select</button>
    `;

    card.querySelector('.select-request-btn').addEventListener('click', () => {
      currentRequestId = req.id;
      loadMessages(currentRequestId);
    });

    requestListContainer.appendChild(card);
  });
}

// ==========================
// LOAD MESSAGES FOR SELECTED REQUEST
// ==========================
function loadMessages(requestId) {
  fetch(`/api/mentor/request/${requestId}/messages`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error('Failed to load messages');
      renderMessages(data.messages);

      chatSection.classList.remove('hidden');
      chatSection.scrollIntoView({ behavior: 'smooth' });
    })
    .catch(err => console.error('❌ Error loading messages:', err));
}

// ==========================
// RENDER CHAT MESSAGES
// ==========================
function renderMessages(messages) {
  chatMessages.innerHTML = '';

  if (!messages.length) {
    chatMessages.innerHTML = '<p class="no-messages">No messages yet. Start the conversation!</p>';
    return;
  }

  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message ' + (msg.sender === 'mentor' ? 'mentor' : 'mentee');
    div.textContent = msg.message;
    chatMessages.appendChild(div);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==========================
// HANDLE SENDING NEW MESSAGE
// ==========================
chatForm?.addEventListener('submit', e => {
  e.preventDefault();

  if (!currentRequestId) {
    alert('Please select a request to chat.');
    return;
  }

  const message = chatInput.value.trim();
  if (!message) return;

  fetch(`/api/mentor/request/${currentRequestId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error('Message send failed');
      chatInput.value = '';
      loadMessages(currentRequestId);
    })
    .catch(err => console.error('❌ Error sending message:', err));
});
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