import { notifications } from '../notifications.js';
import { CommandType, CommandPermission } from './types.js';
import { validateCommandPermission, validateCommandArgs } from './validation.js';
import { formatCommandResponse } from './formatter.js';

export async function handleUserCommand(command, args) {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('Not authenticated');

        const response = await fetch('/api/commands', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Id': userId
            },
            body: JSON.stringify({ command: command.name, args })
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message);
        }

        // Handle broadcast notifications
        if (data.data?.broadcast) {
            notifications.show(`📢 ${data.data.broadcast}`, 'warning', 10000);
        }

        notifications.show(data.message || 'Command executed successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error executing command:', error);
        notifications.show(error.message || 'Failed to execute command', 'error');
        return true; // Return true to prevent the command from being sent as a message
    }
}

export async function fetchUserSuggestions(query) {
    if (!query || query.length < 2) return [];

    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
            headers: {
                'User-Id': userId
            }
        });

        const data = await response.json();
        return data.success ? (data.data || []) : [];
    } catch (error) {
        console.error('Error fetching user suggestions:', error);
        return [];
    }
}