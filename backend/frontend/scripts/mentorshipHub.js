document.addEventListener('DOMContentLoaded', () => {
  const requestListContainer = document.getElementById('request-list');
  const chatSection = document.querySelector('.chat-section');
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

  let currentRequestId = null;

  // Load all assigned requests
  function loadRequests() {
    fetch('/api/mentor/requests')
      .then(res => res.json())
      .then(data => {
        if (!data.success) throw new Error('Failed to load requests');
        displayRequestList(data.requests);
      })
      .catch(err => console.error('Error loading requests:', err));
  }

  // Display request list with Select buttons
  function displayRequestList(requests) {
    requestListContainer.innerHTML = '';

    if (requests.length === 0) {
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

      const selectButton = card.querySelector('.select-request-btn');
      selectButton.addEventListener('click', () => {
        currentRequestId = req.id;
        loadMessages(currentRequestId);
      });

      requestListContainer.appendChild(card);
    });
  }

  // Load messages for the selected request
  function loadMessages(requestId) {
    fetch(`/api/mentor/request/${requestId}/messages`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) throw new Error('Failed to load messages');
        renderMessages(data.messages);

        // Show chat section
        chatSection.classList.remove('hidden');

        // Scroll to chat
        chatSection.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(err => console.error('Error loading messages:', err));
  }

  // Render chat messages
  function renderMessages(messages) {
    chatMessages.innerHTML = '';

    if (messages.length === 0) {
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

  // Handle sending new messages
  chatForm.addEventListener('submit', e => {
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
      body: JSON.stringify({ message })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) throw new Error('Message send failed');
      chatInput.value = '';
      loadMessages(currentRequestId);
    })
    .catch(err => console.error('Error sending message:', err));
  });

  // Initialize
  loadRequests();
});
