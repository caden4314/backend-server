// Authentication utilities
export function getCurrentUser() {
    const userId = localStorage.getItem('userId');
    if (!userId) return null;
    return userId;
}

export function logout() {
    localStorage.removeItem('userId');
    window.location.href = '/';
}

export function redirectIfNotAuthenticated() {
    if (!getCurrentUser()) {
        window.location.href = '/';
        return false;
    }
    return true;
}