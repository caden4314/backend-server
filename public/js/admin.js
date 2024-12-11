import { cmp } from 'geoip-lite';
import { autoLogin } from './api.js';
import { formatDate } from './utils/date.js';
import { formatTime } from './utils/timeUtils.js';

const adminInfo = document.getElementById('admin-info');
const logoutBtn = document.getElementById('logout-btn');
const backToChatBtn = document.getElementById('back-to-chat');
const totalUsersSpan = document.getElementById('total-users');
const totalMessagesSpan = document.getElementById('total-messages');
const activeUsersSpan = document.getElementById('active-users');
const latestUsersDiv = document.getElementById('latest-users');
const latestMessagesDiv = document.getElementById('latest-messages');
const latestRecordsDiv = document.getElementById('latest-records');

let currentUser = null;

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

function formatRecordType(type) {
    switch (type) {
        case 'warnings':
            return '⚠️ Warning';
        case 'mutes':
            return '🔇 Mute';
        case 'bans':
            return '🔨 Ban';
        case 'tempbans':
            return '⏳ Temp Ban';
        default:
            return type;
    }
}

function renderLatestUsers(users) {
    if (!users || users.length === 0) {
        latestUsersDiv.innerHTML = '<p>No recent users</p>';
        return;
    }

    const sortedUsers = [...users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    latestUsersDiv.innerHTML = sortedUsers.map(user => `
        <div class="activity-item">
            <strong>${user.username}</strong>
            <div class="activity-meta">
                Role: ${user.role}
                <br>
                Joined: ${formatDate(user.createdAt)}
            </div>
        </div>
    `).join('');
}

function renderLatestMessages(messages) {
    if (!messages || messages.length === 0) {
        latestMessagesDiv.innerHTML = '<p>No recent messages</p>';
        return;
    }

    const sortedMessages = [...messages]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

    latestMessagesDiv.innerHTML = sortedMessages.map(msg => `
        <div class="activity-item">
            <strong>${msg.username}</strong>
            <div class="activity-content">${msg.content}</div>
            <div class="activity-meta">
                Sent: ${formatDate(msg.timestamp)}
                ${msg.edited ? `<br>Edited: ${formatDate(msg.editedAt)}` : ''}
            </div>
        </div>
    `).join('');
}

function renderLatestRecords(records) {
    if (!records || Object.keys(records).length === 0) {
        latestRecordsDiv.innerHTML = '<p>No recent records</p>';
        return;
    }

    const allRecords = [];
    
    Object.entries(records).forEach(([userId, userRecords]) => {
        Object.entries(userRecords).forEach(([type, typeRecords]) => {
            typeRecords.forEach(record => {
                allRecords.push({
                    ...record,
                    userId,
                    type
                });
            });
        });
    });

    if (allRecords.length === 0) {
        latestRecordsDiv.innerHTML = '<p>No recent records</p>';
        return;
    }

    const sortedRecords = allRecords
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

    latestRecordsDiv.innerHTML = sortedRecords.map(record => `
        <div class="activity-item ${record.type}">
            <strong>${formatRecordType(record.type)}</strong>
            <div class="activity-content">
                By: ${record.adminName}
                <br>
                Reason: ${record.reason}
                ${record.duration ? `<br>Duration: ${formatTime(record.duration)}` : ''}
            </div>
            <div class="activity-meta">
                ${formatDate(record.timestamp)}
            </div>
        </div>
    `).join('');
}

async function loadStats() {
    console.log("ADMIN TRYING TO GET ADMIN PANEL INFO")
    try {
        // Load users
        const users = await fetchWithAuth('/api/admin/users');
        console.log(`ADMIN REQUESTING USERS ${users}`)

        totalUsersSpan.textContent = users.length;

        // Calculate active users (logged in within last 24 hours)
        const now = new Date();
        const activeUsers = users.filter(user => {
            const lastLogin = new Date(user.lastLogin);
            const hoursSinceLogin = (now - lastLogin) / (1000 * 60 * 60);
            return hoursSinceLogin <= 24;
        });
        activeUsersSpan.textContent = activeUsers.length;

        // Load messages
        const messages = await fetchWithAuth('/api/admin/messages');
        totalMessagesSpan.textContent = messages.length;

        // Load records
        const records = await fetchWithAuth('/api/admin/records');

        // Render all sections
        renderLatestUsers(users);
        renderLatestMessages(messages);
        renderLatestRecords(records);
    } catch (error) {
        console.error('Error loading stats:', error);
        totalUsersSpan.textContent = '0';
        totalMessagesSpan.textContent = '0';
        activeUsersSpan.textContent = '0';
        latestUsersDiv.innerHTML = '<p class="error">Failed to load latest users</p>';
        latestMessagesDiv.innerHTML = '<p class="error">Failed to load latest messages</p>';
        latestRecordsDiv.innerHTML = '<p class="error">Failed to load latest records</p>';
    }
}

// Event Listeners
backToChatBtn.addEventListener('click', () => {
    window.location.href = '/home';
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userId');
    window.location.href = '/';
});

async function init() {
    console.log('INIT ADMIN')
    
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
        await loadStats();

        // Refresh stats every 30 seconds
        setInterval(loadStats, 10000);
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        alert(error.message);
        window.location.href = '/';
    } 
}

init();