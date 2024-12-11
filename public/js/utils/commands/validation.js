import { TIME_UNITS, COMMAND_ERRORS } from './constants.js';

export function validateTimeFormat(timeStr) {
    const regex = /^(\d+)([hdwm])$/;
    const match = timeStr.match(regex);
    
    if (!match) {
        throw new Error(COMMAND_ERRORS.INVALID_TIME);
    }
    
    const [, amount, unit] = match;
    const value = parseInt(amount);
    
    if (value <= 0 || !TIME_UNITS[unit]) {
        throw new Error(COMMAND_ERRORS.INVALID_TIME);
    }
    
    return {
        value,
        unit,
        ms: value * TIME_UNITS[unit]
    };
}

export function validateCommandPermission(command, userRole) {
    if (command.permission === 'admin' && userRole !== 'admin') {
        throw new Error(COMMAND_ERRORS.NO_PERMISSION);
    }
    return true;
}

export function validateCommandArgs(command, args) {
    if (command.needsUser && !args[0]) {
        throw new Error(`${command.name} requires a target user`);
    }
    
    if (command.needsTime && !args[1]) {
        throw new Error(`${command.name} requires a duration`);
    }
    
    return true;
}