document.addEventListener('DOMContentLoaded', () => {
  loadAdminMentorshipRequests();
});

// ===============================
// Fetch and display all requests
// ===============================
async function loadAdminMentorshipRequests() {
  try {
    const res = await fetch('/admin/mentorships');
    const data = await res.json();

    if (!data.success || !data.mentorships) {
      showError('Failed to load mentorship requests');
      return;
    }

    renderRequestsList(data.mentorships);
  } catch (err) {
    console.error('❌ Error loading requests:', err);
    showError('Error loading mentorship requests');
  }
}

// ===============================
// Render list of requests
// ===============================
function renderRequestsList(mentorships) {
  const container = document.getElementById('mentorshipTableBody');
  if (!container) {
    console.error('❌ Table body element not found.');
    return;
  }

  container.innerHTML = '';

  if (!mentorships.length) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">No mentorship requests found.</td>
      </tr>`;
    return;
  }

  mentorships.forEach(req => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHTML(req.project_name || '-')}</td>
      <td>${escapeHTML(req.subject || '-')}</td>
      <td>${escapeHTML(req.mentee_name || '-')}</td>
      <td>${escapeHTML(req.mentor_name || '-')}</td>
      <td>${escapeHTML(req.status || '-')}</td>
      <td>${formatTimestamp(req.created_at)}</td>
      <td>
        <button onclick="viewChatMessages(${req.id})">View Chat</button>
      </td>
    `;
    container.appendChild(row);
  });
}

// ===============================
// Fetch and display messages
// ===============================
async function viewChatMessages(requestId) {
  try {
    const res = await fetch(`/admin/mentorships/${requestId}/messages`);
    const data = await res.json();

    if (!data.success || !data.messages) {
      showError('Failed to load chat messages');
      return;
    }

    renderChatMessages(requestId, data.messages);
  } catch (err) {
    console.error('❌ Error loading messages:', err);
    showError('Error loading chat messages');
  }
}

// ===============================
// Render chat messages in chat-modal
// ===============================
function renderChatMessages(requestId, messages) {
  const container = document.getElementById('chat-messages');
  if (!container) {
    console.error('❌ Chat messages container not found.');
    return;
  }

  container.innerHTML = `
    <h4>Chat for Request ID ${requestId}</h4>
    ${messages.length
      ? messages.map(msg => `
        <div class="chat-message ${escapeHTML(msg.sender)}">
          <div class="sender">${escapeHTML(msg.sender)}</div>
          <div class="content">${escapeHTML(msg.message)}</div>
          <div class="timestamp">${formatTimestamp(msg.created_at)}</div>
        </div>
      `).join('')
      : '<p>No messages yet.</p>'
    }
  `;

  // ✅ Show the modal by removing the hidden class
  document.getElementById('chat-modal').classList.remove('hidden');
}

// ===============================
// Close chat modal
// ===============================
function closeChatModal() {
  document.getElementById('chat-modal').classList.add('hidden');
  document.getElementById('chat-messages').innerHTML = '';
}

// ===============================
// Helpers
// ===============================
function showError(msg) {
  alert(msg);
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTimestamp(ts) {
  if (!ts) return '-';
  const date = new Date(ts);
  return date.toLocaleString();
}
