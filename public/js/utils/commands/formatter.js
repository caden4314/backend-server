export function formatCommandResponse(command, result) {
    if (result.broadcast) {
        return {
            message: `Broadcast sent: ${result.broadcast}`,
            notification: {
                text: result.broadcast,
                type: 'warning',
                duration: 10000
            }
        };
    }

    return {
        message: result.message || `${command.name} command executed successfully`,
        notification: {
            text: result.message,
            type: 'success',
            duration: 5000
        }
    };
}

export function formatUserSuggestion(user) {
    return {
        id: user.id,
        username: user.username,
        role: user.role,
        display: `${user.username}${user.role === 'admin' ? ' (Admin)' : ''}`
    };
}