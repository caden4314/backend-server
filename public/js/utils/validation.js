// Input validation utilities
export function validateUsername(username) {
    return username && username.trim().length >= 3;
}

export function validateMessageContent(content) {
    return content && content.trim().length > 0;
}

export function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}