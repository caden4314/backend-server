import { notifications } from './notifications.js';
import { findCommand } from './commands/definitions.js';
import { parseCommandInput } from './commands/parser.js';
import { handleUserCommand } from './commands/handlers.js';

export async function executeCommand(input) {
    const parsed = parseCommandInput(input);
    if (!parsed) return false;

    const command = findCommand(parsed.commandName);
    if (!command) {
        notifications.show('Unknown command', 'error');
        return true;
    }

    return handleUserCommand(command, parsed.args);
}