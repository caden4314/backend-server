import { autoLogin } from './api.js';

const form = document.getElementById('edit-user-form');
const userDetails = document.getElementById('user-details');
const adminInfo = document.getElementById('admin-info');
const backBtn = document.getElementById('back-btn');
const cancelBtn = document.getElementById('cancel-btn');
const logoutBtn = document.getElementById('logout-btn');

let currentUser = null;
let editingUser = null;

async function fetchWithAuth(url, options = {}) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
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

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    const data = await response.json();
    return data.data;
}

async function loadUser(userId) {
    try {
        const user = await fetchWithAuth(`/api/admin/users/${userId}`);
        editingUser = user;
        
        // Populate form fields
        document.getElementById('username').value = user.username;
        document.getElementById('role').value = user.role;
        
        // Display user details
        userDetails.innerHTML = `
            <p><strong>User ID:</strong> ${user.id}</p>
            <p><strong>Created:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
            <p><strong>Last Login:</strong> ${new Date(user.lastLogin).toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${user.ip || 'Unknown'}</p>
            <p><strong>Location:</strong> ${user.location ? 
                `${user.location.city}, ${user.location.country}` : 
                'Unknown'}</p>
        `;
    } catch (error) {
        console.error('Error loading user:', error);
        alert(`Failed to load user: ${error.message}`);
        window.location.href = '/admin';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value,
        role: document.getElementById('role').value
    };
    
    try {
        await fetchWithAuth(`/api/admin/users/${editingUser.id}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        alert('User updated successfully');
        window.location.href = '/admin';
    } catch (error) {
        console.error('Error updating user:', error);
        alert(`Failed to update user: ${error.message}`);
    }
});

backBtn.addEventListener('click', () => {
    window.location.href = '/admin';
});

cancelBtn.addEventListener('click', () => {
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
        
        // Get user ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const editUserId = urlParams.get('id');
        
        if (!editUserId) {
            throw new Error('No user ID provided');
        }
        
        await loadUser(editUserId);
    } catch (error) {
        console.error('Error initializing edit page:', error);
        alert(error.message);
        window.location.href = '/admin';
    }
}

init();