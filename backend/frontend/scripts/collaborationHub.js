// collaborationHub.js

// Elements
const requestListEl = document.getElementById('collaboration-request-list');
const myCollabsListEl = document.getElementById('my-collaborations-list');
const chatSectionEl = document.querySelector('.chat-section');
const chatMessagesEl = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const closeChatBtn = document.getElementById('close-chat-btn');


let currentCollaborationId = null;
let currentUserId = null;
let pollingInterval = null;
let lastMessageCount = 0;

// ==============================
// Get current user info
// ==============================
async function loadCurrentUser() {
  try {
    const res = await fetch('/user');
    if (!res.ok) throw new Error('Not logged in');
    const data = await res.json();
    currentUserId = data.user.id;
  } catch (err) {
    console.error('❌ Unable to get current user:', err);
    currentUserId = null;
  }
}

// ==============================
// Load OWNER requests
// ==============================
async function loadCollaborationRequests() {
  try {
    const res = await fetch('/api/collaboration/my-requests');
    if (!res.ok) throw new Error('Failed to load collaboration requests');
    const requests = await res.json();

    requestListEl.innerHTML = requests.length
      ? ''
      : '<p>No collaboration requests yet.</p>';

    requests.forEach(req => {
      const btn = document.createElement('button');
btn.innerHTML = `
  <div>
    <strong>${req.collaborator_name}</strong><br>
    <span>"${req.project_title}"</span>
  </div>
  <span class="status-badge status-${req.status}">${req.status}</span>
`;

 btn.classList.add('request-card-button');
      btn.disabled = req.status !== 'accepted';
      if (req.status === 'accepted') {
        btn.addEventListener('click', () => openChat(req.collaboration_id));
      }
      requestListEl.appendChild(btn);
    });
  } catch (err) {
    console.error(err);
    requestListEl.innerHTML = '<p>Error loading collaboration requests.</p>';
  }
}

// ==============================
// Load MY accepted collaborations
// ==============================
async function loadMyCollaborations() {
  try {
    const res = await fetch('/api/collaboration/my-collaborations');
    if (!res.ok) throw new Error('Failed to load collaborations');
    const collaborations = await res.json();

    myCollabsListEl.innerHTML = collaborations.length
      ? ''
      : '<p>You have no accepted collaborations yet.</p>';

    collaborations.forEach(collab => {
      const btn = document.createElement('button');
btn.innerHTML = `
  <div>
    <strong>${collab.project_title}</strong><br>
    <span>with ${collab.owner_name}</span>
  </div>
`;

   btn.classList.add('request-card-button');

      btn.addEventListener('click', () => openChat(collab.collaboration_id));
      myCollabsListEl.appendChild(btn);
    });
  } catch (err) {
    console.error(err);
    myCollabsListEl.innerHTML = '<p>Error loading your collaborations.</p>';
  }
}

// ==============================
// Start and stop polling
// ==============================
function startPolling() {
  stopPolling();
  pollingInterval = setInterval(() => {
    if (currentCollaborationId) {
      fetchMessages(currentCollaborationId, false);
    }
  }, 2000); // Poll every 2 seconds for "real-time feel"
}

function stopPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = null;
}

// ==============================
// Open Chat (initial load)
// ==============================
async function openChat(collabId) {
  stopPolling();
  chatMessagesEl.innerHTML = '';
  lastMessageCount = 0;
  currentCollaborationId = collabId;
  chatSectionEl.classList.remove('hidden');
  chatInput.value = '';
  await fetchMessages(collabId, true);
  startPolling();
}

// ==============================
// Fetch messages
// ==============================
async function fetchMessages(collabId, scrollToBottom) {
  try {
    const res = await fetch(`/api/collaboration/${collabId}/messages`);
    if (!res.ok) throw new Error('Failed to load messages');
    const messages = await res.json();

    // Only render NEW messages
    if (messages.length > lastMessageCount) {
      const newMessages = messages.slice(lastMessageCount);
      newMessages.forEach(msg => {
        const div = document.createElement('div');
        div.classList.add('message');
        div.classList.add(msg.sender_id === currentUserId ? 'sent' : 'received');
        div.textContent = msg.message;

        const timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        timestamp.textContent = new Date(msg.created_at).toLocaleString();
        div.appendChild(timestamp);

        chatMessagesEl.appendChild(div);
      });

      lastMessageCount = messages.length;

      if (scrollToBottom || newMessages.length) {
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
      }
    }

  } catch (err) {
    console.error(err);
  }
}

// ==============================
// Send new message
// ==============================
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return alert('Please enter a message.');
  if (!currentCollaborationId) return alert('Please select a collaboration thread first.');

  try {
    const res = await fetch(`/api/collaboration/${currentCollaborationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    chatInput.value = '';
    await fetchMessages(currentCollaborationId, true);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});
closeChatBtn.addEventListener('click', () => {
  chatSectionEl.classList.add('hidden');
  stopPolling();
  currentCollaborationId = null;
  lastMessageCount = 0;
  chatMessagesEl.innerHTML = '';
  chatInput.value = '';
});

// ==============================
// Page Unload Cleanup
// ==============================
window.addEventListener('beforeunload', () => {
  stopPolling();
});

// ==============================
// Initial Page Load
// ==============================
async function init() {
  await loadCurrentUser();
  loadCollaborationRequests();
  loadMyCollaborations();
}

init();
