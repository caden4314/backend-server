const { parseCommand } = require('./commandParser');
const { getUserRecords, addUserRecord } = require('./userRecords');
const { findUserById, findUserByUsername, banUser } = require('./userManager');
const { addMessage } = require('./messageManager');
const { formatTime } = require('./timeUtils');

const BOT_USER = {
    id: 'system',
    username: 'System Bot',
    role: 'system'
};

function handleCommand(command, args, adminUser) {
    if (!adminUser || adminUser.role !== 'admin') {
        throw new Error('Only admins can use commands');
    }

    const input = `/${command} ${args.join(' ')}`;
    const parsed = parseCommand(input);

    switch (parsed.command) {
        case 'ban':
            return handleBanCommand(parsed, adminUser);
        case 'tempban':
            return handleTempBanCommand(parsed, adminUser);
        case 'mute':
            return handleMuteCommand(parsed, adminUser);
        case 'warn':
            return handleWarnCommand(parsed, adminUser);
        case 'say':
            return handleSayCommand(parsed.message);
        case 'broadcast':
            return handleBroadcastCommand(parsed.message);
        case 'unban': // New unban command
            return handleUnbanCommand(parsed, adminUser);
        case 'unmute': // New unmute command
            return handleUnmuteCommand(parsed, adminUser);
        default:
            throw new Error('Unknown command');
    }
}

function handleUnbanCommand(parsed, adminUser) {
    const targetUser = parsed.isId ?
        findUserById(parsed.target) :
        findUserByUsername(parsed.target);

    if (!targetUser) {
        throw new Error('User not found');
    }

    if (!targetUser.banned) {
        return { success: false, message: `${targetUser.username} is not banned.` };
    }

    // Unban the user
    targetUser.banned = false;

    addMessage(
        BOT_USER.id,
        BOT_USER.username,
        `✅ User ${targetUser.username} has been unbanned by ${adminUser.username}.`
    );

    return { success: true, message: `Successfully unbanned ${targetUser.username}` };
}

function handleUnmuteCommand(parsed, adminUser) {
    const targetUser = parsed.isId ?
        findUserById(parsed.target) :
        findUserByUsername(parsed.target);

    if (!targetUser) {
        throw new Error('User not found');
    }

    if (!targetUser.muted) {
        return { success: false, message: `${targetUser.username} is not muted.` };
    }

    // Unmute the user
    targetUser.muted = false;

    addMessage(
        BOT_USER.id,
        BOT_USER.username,
        `🔊 User ${targetUser.username} has been unmuted by ${adminUser.username}.`
    );

    return { success: true, message: `Successfully unmuted ${targetUser.username}` };
}


function handleBanCommand(parsed, adminUser) {
    const targetUser = parsed.isId ?
        findUserById(parsed.target) :
        findUserByUsername(parsed.target);

    if (!targetUser) {
        throw new Error('User not found');
    }

    if (targetUser.role === 'admin') {
        throw new Error('Cannot ban an admin');
    }

    banUser(targetUser.username);

    addUserRecord(targetUser.id, 'bans', {
        adminId: adminUser.id,
        adminName: adminUser.username,
        reason: parsed.reason
    });

    const idInfo = parsed.isId ? ` (ID: ${parsed.target})` : '';
    addMessage(
        BOT_USER.id,
        BOT_USER.username,
        `🔨 User ${targetUser.username}${idInfo} has been banned by ${adminUser.username}. Reason: ${parsed.reason}`
    );

    return { success: true, message: `Successfully banned ${targetUser.username}` };
}

function handleTempBanCommand(parsed, adminUser) {
    const targetUser = parsed.isId ?
        findUserById(parsed.target) :
        findUserByUsername(parsed.target);

    if (!targetUser) {
        throw new Error('User not found');
    }

    if (targetUser.role === 'admin') {
        throw new Error('Cannot ban an admin');
    }

    banUser(targetUser.username);

    addUserRecord(targetUser.id, 'tempbans', {
        adminId: adminUser.id,
        adminName: adminUser.username,
        reason: parsed.reason,
        duration: parsed.duration,
        expiresAt: new Date(Date.now() + parsed.duration).toISOString()
    });

    const idInfo = parsed.isId ? ` (ID: ${parsed.target})` : '';
    addMessage(
        BOT_USER.id,
        BOT_USER.username,
        `⏳ User ${targetUser.username}${idInfo} has been temporarily banned by ${adminUser.username} for ${formatTime(parsed.duration)}. Reason: ${parsed.reason}`
    );

    return { success: true, message: `Successfully temp-banned ${targetUser.username}` };
}

function handleMuteCommand(parsed, adminUser) {
    const targetUser = parsed.isId ?
        findUserById(parsed.target) :
        findUserByUsername(parsed.target);

    if (!targetUser) {
        throw new Error('User not found');
    }

    if (targetUser.role === 'admin') {
        throw new Error('Cannot mute an admin');
    }

    if (!parsed.duration) {
        throw new Error('Mute command requires a duration (e.g. 1h, 2d, 1w)');
    }

    addUserRecord(targetUser.id, 'mutes', {
        adminId: adminUser.id,
        adminName: adminUser.username,
        reason: parsed.reason,
        duration: parsed.duration,
        expiresAt: new Date(Date.now() + parsed.duration).toISOString()
    });

    const idInfo = parsed.isId ? ` (ID: ${parsed.target})` : '';
    addMessage(
        BOT_USER.id,
        BOT_USER.username,
        `🔇 User ${targetUser.username}${idInfo} has been muted by ${adminUser.username} for ${formatTime(parsed.duration)}. Reason: ${parsed.reason}`
    );

    return { success: true, message: `Successfully muted ${targetUser.username}` };
}

function handleWarnCommand(parsed, adminUser) {
    const targetUser = parsed.isId ?
        findUserById(parsed.target) :
        findUserByUsername(parsed.target);

    if (!targetUser) {
        throw new Error('User not found');
    }

    if (targetUser.role === 'admin') {
        throw new Error('Cannot warn an admin');
    }

    addUserRecord(targetUser.id, 'warnings', {
        adminId: adminUser.id,
        adminName: adminUser.username,
        reason: parsed.reason
    });

    const idInfo = parsed.isId ? ` (ID: ${parsed.target})` : '';
    addMessage(
        BOT_USER.id,
        BOT_USER.username,
        `⚠️ User ${targetUser.username}${idInfo} has been warned by ${adminUser.username}. Reason: ${parsed.reason}`
    );

    return { success: true, message: `Successfully warned ${targetUser.username}` };
}

function handleSayCommand(message) {
    if (!message) {
        throw new Error('Message content is required');
    }

    addMessage(BOT_USER.id, BOT_USER.username, message);
    return { success: true, message: 'Message sent' };
}

function handleBroadcastCommand(message) {
    if (!message) {
        throw new Error('Broadcast message is required');
    }

    addMessage(BOT_USER.id, BOT_USER.username, `📢 BROADCAST: ${message}`);
    return {
        success: true,
        message: 'Broadcast sent',
        broadcast: message
    };
}

module.exports = {
    handleCommand,
    BOT_USER
};