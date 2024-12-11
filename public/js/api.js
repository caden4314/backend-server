const API_BASE = '/api';

async function handleResponse(response) {
    const data = await response.json();
    if (!data.success) {
        throw new Error(data.message || 'API request failed');
    }
    return data.data;
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
    const userId = localStorage.getItem('userId');
    const response = await fetch(`${API_BASE}/messages`, {
        headers: {
            'Content-Type': 'application/json',
            'User-Id': userId
        }
    });
    
    return handleResponse(response);
}

export async function sendMessage(content) {
    const userId = localStorage.getItem('userId');
    const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'User-Id': userId
        },
        body: JSON.stringify({ content }),
    });
    
    return handleResponse(response);
}