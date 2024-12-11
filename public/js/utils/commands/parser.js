export function parseCommandInput(input) {
    if (!input.startsWith('/')) return null;

    const parts = input.slice(1).trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    return {
        commandName,
        args
    };
}