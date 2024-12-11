import { autoLogin } from './api.js';

const usersList = document.getElementById('users-list');
const userSearch = document.getElementById('user-search');
const roleFilter = document.getElementById('role-filter');
const statusFilter = document.getElementById('status-filter');
const adminInfo = document.getElementById('admin-info');
const backBtn = document.getElementById('back-btn');
const logoutBtn = document.getElementById('logout-btn');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

let currentUser = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let totalUsers = [];
let filteredUsers = [];

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

function filterUsers() {
    const searchQuery = userSearch.value.toLowerCase();
    const selectedRole = roleFilter.value;
    const selectedStatus = statusFilter.value;

    filteredUsers = totalUsers.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchQuery) ||
                            user.ip?.toLowerCase().includes(searchQuery) ||
                            user.location?.city?.toLowerCase().includes(searchQuery);
        const matchesRole = !selectedRole || user.role === selectedRole;
        
        const lastLogin = new Date(user.lastLogin);
        const now = new Date();
        const daysSinceLogin = (now - lastLogin) / (1000 * 60 * 60 * 24);
        const isActive = daysSinceLogin <= 7;
        const matchesStatus = !selectedStatus || 
                            (selectedStatus === 'active' && isActive) ||
                            (selectedStatus === 'inactive' && !isActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    currentPage = 1;
    updatePagination();
    displayUsers();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function displayUsers() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageUsers = filteredUsers.slice(start, end);

    usersList.innerHTML = pageUsers.map(user => `
        <div class="user-card">
            <div class="user-info">
                <div class="user-header">
                    <h3>${user.username}</h3>
                    <span class="role-badge ${user.role}">${user.role}</span>
                </div>
                <div class="user-meta">
                    <div>ID: ${user.id}</div>
                    <div>Created: ${formatDate(user.createdAt)}</div>
                    <div>Last Login: ${formatDate(user.lastLogin)}</div>
                    <div>IP: ${user.ip || 'Unknown'}</div>
                    <div>Location: ${user.location ? 
                        `${user.location.city}, ${user.location.country}` : 
                        'Unknown'}</div>
                </div>
            </div>
            <div class="user-actions">
                <a href="/edit-user.html?id=${user.id}" class="btn-edit">Edit User</a>
                ${user.id !== currentUser.id ? 
                    `<button class="btn-delete" onclick="deleteUser('${user.id}')">Delete User</button>` : 
                    ''}
            </div>
        </div>
    `).join('');
}

async function loadUsers() {
    try {
        usersList.innerHTML = '<p>Loading users...</p>';
        totalUsers = await fetchWithAuth('/api/admin/users');
        filteredUsers = [...totalUsers];
        updatePagination();
        displayUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = `<p class="error">Failed to load users: ${error.message}</p>`;
        if (error.message.includes('Authentication') || error.message.includes('Access denied')) {
            window.location.href = '/';
        }
    }
}

window.deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        await fetchWithAuth(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        await loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Failed to delete user: ${error.message}`);
    }
};

// Event Listeners
userSearch.addEventListener('input', filterUsers);
roleFilter.addEventListener('change', filterUsers);
statusFilter.addEventListener('change', filterUsers);

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
        displayUsers();
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
        displayUsers();
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
        await loadUsers();
    } catch (error) {
        console.error('Error initializing users page:', error);
        alert(error.message);
        window.location.href = '/';
    }
}

init();