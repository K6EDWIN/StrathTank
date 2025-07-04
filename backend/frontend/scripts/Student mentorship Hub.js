// ==========================
// STATE
// ==========================
let selectedRequestId = null;

// ==========================
// INITIALIZE
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  loadUserMentorshipRequests();

  document.getElementById('chat-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    sendUserMessage();
  });

  document.getElementById('logoutBtn')?.addEventListener('click', openLogoutConfirm);
  document.getElementById('confirmLogoutBtn')?.addEventListener('click', logout);
  document.getElementById('cancelLogoutBtn')?.addEventListener('click', closeLogoutConfirm);
});

// ==========================
// LOAD MENTORSHIP REQUESTS
// ==========================
async function loadUserMentorshipRequests() {
  try {
    const res = await fetch('/user/mentorship/dashboard', { credentials: 'include' });
    const data = await res.json();

    if (!data.success) throw new Error(data.message);
    renderRequestList(data.mentorshipRequests);
  } catch (err) {
    console.error('❌ Error loading requests:', err);
    alert('Failed to load your mentorship requests.');
  }
}

// ==========================
// RENDER REQUEST LIST
// ==========================
function renderRequestList(requests) {
  const listContainer = document.getElementById('request-list');
  listContainer.innerHTML = '';

  if (!requests.length) {
    listContainer.innerHTML = '<p>No mentorship requests found.</p>';
    return;
  }

  requests.forEach(request => {
    const card = document.createElement('div');
    card.className = 'request-card';

    card.innerHTML = `
      <div class="request-info">
        <div class="request-title">${request.subject}</div>
        <div class="request-status">Status: ${request.status}</div>
      </div>
      <button class="select-request-btn">Open Chat</button>
    `;

    card.querySelector('.select-request-btn').addEventListener('click', () => selectRequest(request));
    listContainer.appendChild(card);
  });
}

// ==========================
// SELECT A REQUEST
// ==========================
function selectRequest(request) {
  selectedRequestId = request.id;

  const chatSection = document.getElementById('chatSection');
  chatSection.classList.remove('hidden');
  document.getElementById('chat-messages').innerHTML = '<p>Loading conversation...</p>';

  // ✅ Scroll smoothly to the chat section
  chatSection.scrollIntoView({ behavior: 'smooth' });

  loadMessages(selectedRequestId);
}

// ==========================
// LOAD MESSAGES
// ==========================
async function loadMessages(requestId) {
  try {
    const res = await fetch(`/user/mentorship/request/${requestId}/messages`, { credentials: 'include' });
    const data = await res.json();

    if (!data.success) throw new Error(data.message);
    renderMessages(data.messages);
  } catch (err) {
    console.error('❌ Error loading messages:', err);
    document.getElementById('chat-messages').innerHTML = '<p>Failed to load messages.</p>';
  }
}

// ==========================
// RENDER MESSAGES
// ==========================
function renderMessages(messages) {
  const chatContainer = document.getElementById('chat-messages');
  chatContainer.innerHTML = '';

  if (!messages.length) {
    chatContainer.innerHTML = '<p>No messages yet. Start the conversation!</p>';
    return;
  }

  messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', msg.sender === 'mentee' ? 'mentee' : 'mentor');
    msgDiv.textContent = msg.message;
    chatContainer.appendChild(msgDiv);
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ==========================
// SEND USER MESSAGE
// ==========================
async function sendUserMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();

  if (!message || !selectedRequestId) return;

  try {
    const res = await fetch(`/user/mentorship/request/${selectedRequestId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message })
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.message);
    input.value = '';
    loadMessages(selectedRequestId);
  } catch (err) {
    console.error('❌ Error sending message:', err);
    alert('Failed to send message.');
  }
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
