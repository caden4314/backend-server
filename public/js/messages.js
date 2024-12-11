import { autoLogin } from './api.js';

const messagesList = document.getElementById('messages-list');
const messageSearch = document.getElementById('message-search');
const userFilter = document.getElementById('user-filter');
const dateFilter = document.getElementById('date-filter');
const adminInfo = document.getElementById('admin-info');
const backBtn = document.getElementById('back-btn');
const logoutBtn = document.getElementById('logout-btn');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

let currentUser = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let totalMessages = [];
let filteredMessages = [];

async function fetchWithAuth(url, options = {}) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = '/';
        throw new Error('Not authenticated');
    }
    
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            'User-Id': userId
        }
    });

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.message || 'Request failed');
    }

    return data.data;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function filterMessages() {
    const searchQuery = messageSearch.value.toLowerCase();
    const selectedUser = userFilter.value;
    const selectedDate = dateFilter.value;

    filteredMessages = totalMessages.filter(message => {
        const matchesSearch = message.content.toLowerCase().includes(searchQuery) ||
                            message.username.toLowerCase().includes(searchQuery);
        const matchesUser = !selectedUser || message.userId === selectedUser;
        
        const messageDate = new Date(message.timestamp);
        const now = new Date();
        let matchesDate = true;

        if (selectedDate === 'today') {
            matchesDate = messageDate.toDateString() === now.toDateString();
        } else if (selectedDate === 'week') {
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            matchesDate = messageDate >= weekAgo;
        } else if (selectedDate === 'month') {
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            matchesDate = messageDate >= monthAgo;
        }

        return matchesSearch && matchesUser && matchesDate;
    });

    currentPage = 1;
    updatePagination();
    displayMessages();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function displayMessages() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageMessages = filteredMessages.slice(start, end);

    messagesList.innerHTML = `
        <div class="messages-header">
            <h2>Messages (${filteredMessages.length} total)</h2>
            <button class="btn btn-delete" onclick="window.deleteAllMessages()">Delete All Messages</button>
        </div>
        ${pageMessages.map(msg => `
            <div class="message-card">
                <div class="message-header">
                    <div class="message-info">
                        <strong>${msg.username}</strong>
                        <span class="message-meta">
                            ID: ${msg.id} | User ID: ${msg.userId}
                        </span>
                        <span class="message-meta">
                            Sent: ${formatDate(msg.timestamp)}
                            ${msg.edited ? ` | Edited: ${formatDate(msg.editedAt)}` : ''}
                        </span>
                    </div>
                </div>
                <div class="message-content">${msg.content}</div>
                <div class="message-actions">
                    <button class="btn btn-delete" onclick="window.deleteMessage('${msg.id}')">Delete</button>
                </div>
            </div>
        `).join('')}`;
}

async function loadMessages() {
    try {
        messagesList.innerHTML = '<p>Loading messages...</p>';
        totalMessages = await fetchWithAuth('/api/admin/messages');
        
        // Update user filter options
        const users = new Set(totalMessages.map(msg => msg.userId));
        userFilter.innerHTML = '<option value="">All Users</option>' +
            Array.from(users).map(userId => {
                const username = totalMessages.find(msg => msg.userId === userId)?.username;
                return `<option value="${userId}">${username}</option>`;
            }).join('');

        filteredMessages = [...totalMessages];
        updatePagination();
        displayMessages();
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesList.innerHTML = `<p class="error">Failed to load messages: ${error.message}</p>`;
        if (error.message.includes('Authentication') || error.message.includes('Access denied')) {
            window.location.href = '/';
        }
    }
}

window.deleteMessage = async (messageId) => {
    try {
        await fetchWithAuth(`/api/admin/messages/${messageId}`, {
            method: 'DELETE'
        });
        await loadMessages();
    } catch (error) {
        console.error('Error deleting message:', error);
        alert(`Failed to delete message: ${error.message}`);
    }
};

window.deleteAllMessages = async () => {
    try {
        await fetchWithAuth('/api/admin/messages', {
            method: 'DELETE'
        });
        await loadMessages();
    } catch (error) {
        console.error('Error deleting all messages:', error);
        alert(`Failed to delete all messages: ${error.message}`);
    }
};

// Event Listeners
messageSearch.addEventListener('input', filterMessages);
userFilter.addEventListener('change', filterMessages);
dateFilter.addEventListener('change', filterMessages);

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
        displayMessages();
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
        displayMessages();
    }
});

backBtn.addEventListener('click', () => {
    window.location.href = '/admin';
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userId');
    window.location.href = '/';
});

async function init() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            throw new Error('Not authenticated');
        }

        currentUser = await autoLogin(userId);
        
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Access denied');
        }
        
        adminInfo.textContent = `Admin: ${currentUser.username}`;
        await loadMessages();
    } catch (error) {
        console.error('Error initializing messages page:', error);
        alert(error.message);
        window.location.href = '/';
    }
}

init();