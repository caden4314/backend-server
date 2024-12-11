import { getMessages, sendMessage, autoLogin } from './api.js';
import { executeCommand } from './utils/commands.js';
import { notifications } from './utils/notifications.js';
import { MessageList } from './components/MessageList.js';
import { CommandMenu } from './utils/commandMenu.js';

const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const userInfo = document.getElementById('user-info');
const roleBadge = document.getElementById('role-badge');
const adminBtn = document.getElementById('admin-btn');
const logoutBtn = document.getElementById('logout-btn');

let currentUser = null;
let messageList = null;
let commandMenu = null;
let messages = [];

// Global handlers for MessageList
window.handleContextMenu = (e, messageId) => {
    e.preventDefault();
    messageList.showContextMenu(e, messageId);
};

window.editMessage = async (messageId) => {
    messageList.startEditing(messageId);
};

window.deleteMessage = async (messageId) => {
    if (await messageList.deleteMessage(messageId)) {
        await loadMessages();
        notifications.show('Message deleted', 'success');
    } else {
        notifications.show('Failed to delete message', 'error');
    }
};

window.copyMessage = (messageId) => {
    messageList.copyMessageContent(messageId);
};

window.copyIds = (messageId) => {
    messageList.copyMessageIds(messageId);
};

window.saveEdit = async (messageId) => {
    const editInput = document.querySelector(`.message[data-id="${messageId}"] .edit-input`);
    if (!editInput) return;

    const newContent = editInput.value.trim();
    if (!newContent) return;

    if (await messageList.saveEdit(messageId, newContent)) {
        await loadMessages();
    }
};

window.cancelEdit = () => {
    messageList.cancelEdit();
};

async function loadMessages() {
    try {
        messages = await getMessages();
        messageList.render(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
        notifications.show('Failed to load messages', 'error');
    }
}

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    try {
        if (content.startsWith('/')) {
            const commandExecuted = await executeCommand(content);
            if (commandExecuted) {
                messageInput.value = '';
                await loadMessages();
            }
            return;
        }

        await sendMessage(content);
        messageInput.value = '';
        await loadMessages();
    } catch (error) {
        console.error('Error sending message:', error);
        notifications.show('Failed to send message', 'error');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userId');
    window.location.href = '/';
});

async function init() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            window.location.href = '/';
            return;
        }

        currentUser = await autoLogin(userId);
        messageList = new MessageList(messagesDiv, currentUser);
        commandMenu = new CommandMenu(messageInput, currentUser.role);
        
        // Update role badge
        roleBadge.textContent = currentUser.role.toUpperCase();
        roleBadge.className = `role-badge ${currentUser.role}`;
        
        // Show admin button if user is admin
        if (currentUser.role === 'admin') {
            adminBtn.style.display = 'flex';
            adminBtn.addEventListener('click', () => {
                window.location.href = '/admin';
            });
        }

        await loadMessages();
        setInterval(loadMessages, 3000);
    } catch (error) {
        console.error('Error initializing chat:', error);
        notifications.show('Authentication failed', 'error');
        window.location.href = '/';
    }
}

init();