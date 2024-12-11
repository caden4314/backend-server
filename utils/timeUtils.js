function parseTime(timeStr) {
    const regex = /^(\d+)([hdwm])$/;
    const match = timeStr.match(regex);
    
    if (!match) {
        throw new Error('Invalid time format. Use format: number + h/d/w/m (e.g., 1h, 2d, 1w, 1m)');
    }
    
    const [, amount, unit] = match;
    const value = parseInt(amount);
    
    const multipliers = {
        h: 60 * 60 * 1000,        // hours to ms
        d: 24 * 60 * 60 * 1000,   // days to ms
        w: 7 * 24 * 60 * 60 * 1000, // weeks to ms
        m: 30 * 24 * 60 * 60 * 1000 // months to ms (approximate)
    };
    
    return value * multipliers[unit];
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
}

module.exports = { parseTime, formatTime };