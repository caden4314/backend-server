// API utilities
const API_BASE = '/api';

async function handleResponse(response) {
    const data = await response.json();
    if (!data.success) {
        throw new Error(data.message || 'API request failed');
    }
    return data.data;
}

export async function fetchWithAuth(url, options = {}) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        throw new Error('Not authenticated');
    }
    
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            'User-Id': userId
        }
    }).then(handleResponse);
}

export async function signIn(username) {
    const response = await fetch(`${API_BASE}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
    });
    
    return handleResponse(response);
}

export async function autoLogin(userId) {
    const response = await fetch(`${API_BASE}/autologin/${userId}`, {
        headers: {
            'Content-Type': 'application/json',
            'User-Id': userId
        }
    });
    
    return handleResponse(response);
}

export async function getMessages() {
    return fetchWithAuth(`${API_BASE}/messages`);
}

export async function sendMessage(content) {
    return fetchWithAuth(`${API_BASE}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content })
    });
}

export async function updateMessage(messageId, content) {
    return fetchWithAuth(`${API_BASE}/messages/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify({ content })
    });
}

export async function deleteMessage(messageId) {
    return fetchWithAuth(`${API_BASE}/messages/${messageId}`, {
        method: 'DELETE'
    });
}