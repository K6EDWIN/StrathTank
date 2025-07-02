document.addEventListener('DOMContentLoaded', () => {
  loadUserMentorshipRequests();

  // Attach listener for sending a chat message
  const chatForm = document.getElementById('chat-form');
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendUserMessage();
    });
  }
});

let selectedRequestId = null;

/**
 * Load the user's mentorship requests from the server
 */
function loadUserMentorshipRequests() {
  fetch('/user/mentorship/dashboard')
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error(data.message);
      renderRequestList(data.mentorshipRequests);
    })
    .catch(err => {
      console.error('❌ Error loading requests:', err);
      alert('Failed to load your mentorship requests.');
    });
}

/**
 * Render the list of mentorship requests
 */
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

    const btn = card.querySelector('.select-request-btn');
    btn.addEventListener('click', () => selectRequest(request));

    listContainer.appendChild(card);
  });
}

/**
 * When user selects a request to chat
 */
function selectRequest(request) {
  console.log('✅ Selected request:', request);
  selectedRequestId = request.id;

  document.getElementById('chatSection').classList.remove('hidden');
  document.getElementById('chat-messages').innerHTML = '<p>Loading conversation...</p>';

  loadMessages(selectedRequestId);
}

/**
 * Load messages for a given request
 */
function loadMessages(requestId) {
  fetch(`/user/mentorship/request/${requestId}/messages`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error(data.message);
      renderMessages(data.messages);
    })
    .catch(err => {
      console.error('❌ Error loading messages:', err);
      document.getElementById('chat-messages').innerHTML = '<p>Failed to load messages.</p>';
    });
}

/**
 * Render the messages in the chat window
 */
function renderMessages(messages) {
  const chatContainer = document.getElementById('chat-messages');
  chatContainer.innerHTML = '';

  if (!messages.length) {
    chatContainer.innerHTML = '<p>No messages yet. Start the conversation!</p>';
    return;
  }

  messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(msg.sender === 'mentee' ? 'mentee' : 'mentor');
    msgDiv.textContent = msg.message;
    chatContainer.appendChild(msgDiv);
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Send a new message
 */
function sendUserMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();

  if (!message || !selectedRequestId) return;

  fetch(`/user/mentorship/request/${selectedRequestId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error(data.message);
      input.value = '';
      loadMessages(selectedRequestId);
    })
    .catch(err => {
      console.error('❌ Error sending message:', err);
      alert('Failed to send message.');
    });
}
function logoutUser() {
  // Show logout loader
  const loader = document.getElementById('logout-loader');
  loader.style.display = 'flex';

  // Optional delay for UX (e.g. 1.5 seconds)
  setTimeout(() => {
    fetch('/user/logout', {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => {
        if (res.redirected) {
          window.location.href = res.url;
        } else {
          loader.style.display = 'none'; // hide loader
          alert('Logout failed.');
        }
      })
      .catch(err => {
        loader.style.display = 'none'; // hide loader
        console.error('Logout error:', err);
        alert('Error logging out.');
      });
  }, 1500); // Show loader before logging out
}