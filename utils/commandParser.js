const { parseTime } = require('./timeUtils');

function parseCommand(input) {
    const parts = input.slice(1).trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Special handling for broadcast and say commands
    if (['broadcast', 'say'].includes(command)) {
        return {
            command,
            message: args.join(' ')
        };
    }
    
    // Parse target - could be ID or username
    const target = args[0];
    if (!target) {
        throw new Error(`${command} requires a target user`);
    }
    
    const isId = /^\d+$/.test(target);
    
    // Parse duration for temporary actions
    let duration = null;
    if (['tempban', 'mute'].includes(command)) {
        const timeArg = args[1];
        if (!timeArg) {
            throw new Error(`${command} requires a duration (e.g. 1h, 2d, 1w)`);
        }
        duration = parseTime(timeArg);
    }
    
    // Get reason (remaining args)
    const reasonStart = ['tempban', 'mute'].includes(command) ? 2 : 1;
    const reason = args.slice(reasonStart).join(' ') || 'No reason provided';
    
    return {
        command,
        target,
        isId,
        duration,
        reason
    };
}

module.exports = { parseCommand };