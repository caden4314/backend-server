import { COMMANDS, getAvailableCommands } from './commands/definitions.js';
import { fetchUserSuggestions } from './commands/handlers.js';

export class CommandMenu {
    constructor(inputElement, userRole) {
        this.input = inputElement;
        this.userRole = userRole;
        this.menu = this.createMenu();
        this.visible = false;
        this.selectedIndex = -1;
        this.filteredCommands = [];
        this.userSuggestions = [];
        this.setupListeners();
    }

    createMenu() {
        const menu = document.createElement('div');
        menu.className = 'command-menu';
        this.input.parentElement.insertBefore(menu, this.input);
        return menu;
    }

    setupListeners() {
        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Add click listener to the menu itself
        this.menu.addEventListener('click', (e) => {
            const item = e.target.closest('.command-item');
            if (item) {
                const index = parseInt(item.dataset.index);
                const suggestions = [...this.filteredCommands, ...this.userSuggestions];
                const selected = suggestions[index];
                
                if (this.filteredCommands.includes(selected)) {
                    this.selectCommand(selected);
                } else {
                    this.selectUser(selected);
                }
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.message-input-container')) {
                this.hide();
            }
        });
    }

    async handleInput() {
        const value = this.input.value;
        
        if (!value.startsWith('/')) {
            this.hide();
            return;
        }

        const parts = value.slice(1).split(/\s+/);
        const command = parts[0].toLowerCase();
        const currentArg = parts[parts.length - 1];
        
        // Show command suggestions when typing the command name
        if (parts.length === 1) {
            this.filteredCommands = getAvailableCommands(this.userRole)
                .filter(cmd => cmd.name.toLowerCase().includes(command.toLowerCase()));
            this.userSuggestions = [];
            this.selectedIndex = this.filteredCommands.length > 0 ? 0 : -1;
            this.visible = this.filteredCommands.length > 0;
            this.render();
            return;
        }

        // Find the matching command
        const matchedCommand = COMMANDS.find(cmd => cmd.name === command);
        if (!matchedCommand) {
            this.hide();
            return;
        }

        // Show user suggestions for commands that need a user target
        if (matchedCommand.needsUser && parts.length === 2 && currentArg) {
            this.userSuggestions = await fetchUserSuggestions(currentArg);
            this.filteredCommands = [];
            this.selectedIndex = this.userSuggestions.length > 0 ? 0 : -1;
            this.visible = this.userSuggestions.length > 0;
            this.render();
        } else {
            this.hide();
        }
    }

    handleKeydown(e) {
        if (!this.visible) return;

        const suggestions = [...this.filteredCommands, ...this.userSuggestions];
        if (!suggestions.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, suggestions.length - 1);
                this.render();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.render();
                break;
            case 'Tab':
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    const item = suggestions[this.selectedIndex];
                    if (this.filteredCommands.includes(item)) {
                        this.selectCommand(item);
                    } else {
                        this.selectUser(item);
                    }
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.hide();
                break;
        }
    }

    show() {
        this.visible = true;
        this.menu.classList.add('visible');
        this.render();
    }

    hide() {
        this.visible = false;
        this.menu.classList.remove('visible');
        this.selectedIndex = -1;
        this.filteredCommands = [];
        this.userSuggestions = [];
    }

    render() {
        if (!this.visible) {
            this.menu.classList.remove('visible');
            return;
        }

        this.menu.classList.add('visible');

        const commandItems = this.filteredCommands.map((cmd, index) => `
            <div class="command-item ${index === this.selectedIndex ? 'selected' : ''}" 
                 data-index="${index}">
                <div class="icon">${cmd.icon}</div>
                <div class="content">
                    <div class="name">${cmd.name}</div>
                    <div class="description">${cmd.description}</div>
                    <div class="usage">${cmd.usage}</div>
                    ${cmd.examples ? `
                        <div class="examples">
                            ${cmd.examples.map(ex => `<div class="example">${ex}</div>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        const userItems = this.userSuggestions.map((user, index) => `
            <div class="command-item ${index === this.selectedIndex ? 'selected' : ''}" 
                 data-index="${index}">
                <div class="icon">👤</div>
                <div class="content">
                    <div class="name">${user.username}</div>
                    <div class="description">ID: ${user.id}</div>
                    <div class="usage">Role: ${user.role}</div>
                </div>
            </div>
        `).join('');

        this.menu.innerHTML = commandItems + userItems || '<div class="no-results">No suggestions</div>';

        // Add hover effect handlers
        this.menu.querySelectorAll('.command-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.selectedIndex = parseInt(item.dataset.index);
                this.render();
            });
        });
    }

    selectCommand(command) {
        this.input.value = `/${command.name} `;
        this.input.focus();
        this.hide();
    }

    selectUser(user) {
        const parts = this.input.value.split(/\s+/);
        parts[1] = user.username;
        this.input.value = parts.join(' ') + ' ';
        this.input.focus();
        this.hide();
    }
}