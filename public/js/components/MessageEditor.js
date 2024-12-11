import { updateMessage } from '../utils/api.js';
import { validateMessageContent } from '../utils/validation.js';

export class MessageEditor {
    constructor(message, onSave, onCancel) {
        this.message = message;
        this.onSave = onSave;
        this.onCancel = onCancel;
    }

    render() {
        return `
            <div class="edit-container">
                <input type="text" class="edit-input" value="${this.message.content}">
                <div class="edit-actions">
                    <button class="save-btn">Save</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            </div>
        `;
    }

    async handleSave(newContent) {
        if (!validateMessageContent(newContent)) {
            alert('Message content cannot be empty');
            return;
        }

        try {
            await updateMessage(this.message.id, newContent);
            this.onSave();
        } catch (error) {
            console.error('Error updating message:', error);
            alert('Failed to update message');
        }
    }

    setupListeners(container) {
        const input = container.querySelector('.edit-input');
        const saveBtn = container.querySelector('.save-btn');
        const cancelBtn = container.querySelector('.cancel-btn');

        input.focus();
        input.selectionStart = input.value.length;

        saveBtn.addEventListener('click', () => this.handleSave(input.value));
        cancelBtn.addEventListener('click', this.onCancel);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSave(input.value);
            } else if (e.key === 'Escape') {
                this.onCancel();
            }
        });
    }
}