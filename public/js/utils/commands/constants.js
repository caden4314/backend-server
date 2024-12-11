export const TIME_UNITS = {
    h: 60 * 60 * 1000,        // hours to ms
    d: 24 * 60 * 60 * 1000,   // days to ms
    w: 7 * 24 * 60 * 60 * 1000, // weeks to ms
    m: 30 * 24 * 60 * 60 * 1000 // months to ms (approximate)
};

export const COMMAND_ERRORS = {
    INVALID_TIME: 'Invalid time format. Use format: number + h/d/w/m (e.g., 1h, 2d, 1w, 1m)',
    NO_PERMISSION: 'You do not have permission to use this command',
    UNKNOWN_COMMAND: 'Unknown command',
    USER_NOT_FOUND: 'User not found',
    INVALID_ARGS: 'Invalid command arguments'
};