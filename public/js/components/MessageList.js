import { deleteMessage, updateMessage } from '../utils/api.js';
import { notifications } from '../utils/notifications.js';

export class MessageList {
    constructor(container, currentUser) {
        this.container = container;
        this.currentUser = currentUser;
        this.messages = [];
        this.editingMessageId = null;
        this.setupListeners();
    }

    setupListeners() {
        // Handle all button clicks
        this.container.addEventListener('click', async (e) => {
            const target = e.target;
            const messageEl = target.closest('.message');
            if (!messageEl) return;

            const messageId = messageEl.dataset.id;

            // Handle edit buttons
            if (target.matches('.save-btn')) {
                const input = messageEl.querySelector('.edit-input');
                if (input) {
                    await this.saveEdit(messageId, input.value);
                }
                return;
            }

            if (target.matches('.cancel-btn')) {
                this.cancelEdit();
                return;
            }

            // Handle action buttons
            const actionBtn = target.closest('.message-action-btn');
            if (!actionBtn) return;

            const action = actionBtn.dataset.action;
            switch (action) {
                case 'edit':
                    this.startEditing(messageId);
                    break;
                case 'delete':
                    await this.deleteMessage(messageId);
                    break;
                case 'copy':
                    this.copyMessageContent(messageId);
                    break;
                case 'copy-ids':
                    this.copyMessageIds(messageId);
                    break;
            }
        });

        // Handle edit input keydown
        this.container.addEventListener('keydown', async (e) => {
            if (!this.editingMessageId) return;

            const input = e.target.closest('.edit-input');
            if (!input) return;

            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                await this.saveEdit(this.editingMessageId, input.value);
            } else if (e.key === 'Escape') {
                this.cancelEdit();
            }
        });
    }

    startEditing(messageId) {
        this.editingMessageId = messageId;
        this.render(this.messages);
        const input = this.container.querySelector(`.message[data-id="${messageId}"] .edit-input`);
        if (input) {
            input.focus();
            input.selectionStart = input.value.length;
        }
    }

    async saveEdit(messageId, content) {
        const trimmedContent = content.trim();
        if (!trimmedContent) {
            notifications.show('Message cannot be empty', 'error');
            return false;
        }

        try {
            await updateMessage(messageId, trimmedContent);
            this.editingMessageId = null;
            notifications.show('Message updated', 'success');
            return true;
        } catch (error) {
            console.error('Error updating message:', error);
            notifications.show('Failed to update message', 'error');
            return false;
        }
    }

    cancelEdit() {
        this.editingMessageId = null;
        this.render(this.messages);
    }

    async deleteMessage(messageId) {
        if (!confirm('Are you sure you want to delete this message?')) return false;

        try {
            await deleteMessage(messageId);
            notifications.show('Message deleted', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            notifications.show('Failed to delete message', 'error');
            return false;
        }
    }

    copyMessageContent(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        
        navigator.clipboard.writeText(message.content);
        notifications.show('Message copied to clipboard', 'success');
    }

    copyMessageIds(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        
        const idInfo = `Message ID: ${message.id}\nUser ID: ${message.userId}`;
        navigator.clipboard.writeText(idInfo);
        notifications.show('IDs copied to clipboard', 'success');
    }

    render(messages) {
        this.messages = messages;
        this.container.innerHTML = messages.map(msg => this.renderMessage(msg)).join('');
        this.container.scrollTop = this.container.scrollHeight;
    }

    renderMessage(msg) {
        const isSystem = msg.userId === 'system';
        const canModify = msg.userId === this.currentUser.id || this.currentUser.role === 'admin';
        const isAdmin = this.currentUser.role === 'admin';
        
        return `
            <div class="message ${isSystem ? 'system-message' : ''}" data-id="${msg.id}">
                <div class="meta">
                    <span class="username">${msg.username}</span>
                    <span class="time">${new Date(msg.timestamp).toLocaleString()}</span>
                    ${msg.edited ? '<span class="edited-tag">(edited)</span>' : ''}
                    ${isAdmin ? `<span class="id-tag">ID: ${msg.id}</span>` : ''}
                </div>
                
                ${this.editingMessageId === msg.id ? `
                    <div class="edit-container">
                        <input type="text" class="edit-input" value="${msg.content}">
                        <div class="edit-actions">
                            <button class="save-btn">Save</button>
                            <button class="cancel-btn">Cancel</button>
                        </div>
                    </div>
                ` : `
                    <div class="content">${msg.content}</div>
                `}

                ${!isSystem && (canModify || isAdmin) ? `
                    <div class="message-actions">
                        ${canModify ? `
                            <button class="message-action-btn edit" data-action="edit">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="message-action-btn delete" data-action="delete">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : ''}
                        <button class="message-action-btn" data-action="copy">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        ${isAdmin ? `
                            <button class="message-action-btn" data-action="copy-ids">
                                <i class="fas fa-id-card"></i> Copy IDs
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }
}