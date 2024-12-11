export function showNotification(element, message, duration = 2000) {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    element.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
}

export function createLoadingState(message = 'Loading...') {
    return `<div class="loading">${message}</div>`;
}

export function createErrorState(message) {
    return `<div class="error">${message}</div>`;
}