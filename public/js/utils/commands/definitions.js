import { CommandType, CommandPermission } from './types.js';

export const COMMANDS = [{
        name: 'ban',
        type: CommandType.MODERATION,
        permission: CommandPermission.ADMIN,
        description: 'Ban a user from the server',
        usage: '/ban <user/id> [reason]',
        icon: '🔨',
        needsUser: true,
        examples: [
            '/ban username Spamming',
            '/ban 123456789 Breaking rules'
        ]
    },
    {
        name: 'tempban',
        type: CommandType.MODERATION,
        permission: CommandPermission.ADMIN,
        description: 'Temporarily ban a user',
        usage: '/tempban <user/id> <duration> [reason]',
        icon: '⏳',
        needsUser: true,
        examples: [
            '/tempban username 1d Cooling off',
            '/tempban 123456789 7d Multiple violations'
        ]
    },
    {
        name: 'mute',
        type: CommandType.MODERATION,
        permission: CommandPermission.ADMIN,
        description: 'Mute a user for a specified duration',
        usage: '/mute <user/id> <duration> [reason]',
        icon: '🔇',
        needsUser: true,
        examples: [
            '/mute username 1h Excessive spam',
            '/mute 123456789 24h Bad behavior'
        ]
    },
    {
        name: 'warn',
        type: CommandType.MODERATION,
        permission: CommandPermission.ADMIN,
        description: 'Issue a warning to a user',
        usage: '/warn <user/id> [reason]',
        icon: '⚠️',
        needsUser: true,
        examples: [
            '/warn username First warning',
            '/warn 123456789 Please follow rules'
        ]
    },
    {
        name: 'say',
        type: CommandType.SYSTEM,
        permission: CommandPermission.ADMIN,
        description: 'Send a message as the system',
        usage: '/say <message>',
        icon: '💬',
        examples: [
            '/say Welcome everyone!',
            '/say Server maintenance in 5 minutes'
        ]
    },
    {
        name: 'broadcast',
        type: CommandType.SYSTEM,
        permission: CommandPermission.ADMIN,
        description: 'Send an announcement to all users',
        usage: '/broadcast <message>',
        icon: '📢',
        examples: [
            '/broadcast Important announcement!',
            '/broadcast Server update completed'
        ]
    },
    {
        name: 'unban',
        type: CommandType.MODERATION,
        permission: CommandPermission.ADMIN,
        description: 'Unban a user from the server',
        usage: '/unban <user/id>',
        icon: '✅',
        needsUser: true,
        examples: [
            '/unban username',
            '/unban 123456789'
        ]
    },
    {
        name: 'unmute',
        type: CommandType.MODERATION,
        permission: CommandPermission.ADMIN,
        description: 'Unmute a user on the server',
        usage: '/unmute <user/id>',
        icon: '🔊',
        needsUser: true,
        examples: [
            '/unmute username',
            '/unmute 123456789'
        ]
    }
];

export function findCommand(name) {
    return COMMANDS.find(cmd => cmd.name.toLowerCase() === name.toLowerCase());
}

export function getAvailableCommands(userRole) {
    return COMMANDS.filter(cmd => {
        if (cmd.permission === CommandPermission.ALL) return true;
        if (cmd.permission === CommandPermission.ADMIN) return userRole === 'admin';
        if (cmd.permission === CommandPermission.USER) return true;
        return false;
    });
}
