const path = require('path');
const { readJsonFile, writeJsonFile } = require('./fileSystem');

const messagesFilePath = path.join(__dirname, '..', 'data', 'messages.json');

function loadMessages() {
  return readJsonFile(messagesFilePath, []);
}

function saveMessages(messages) {
  return writeJsonFile(messagesFilePath, messages);
}

function findMessageById(id) {
  const messages = loadMessages();
  return messages.find(m => m.id === id);
}

function addMessage(userId, username, content) {
  const messages = loadMessages();
  const newMessage = {
    id: Date.now().toString(),
    userId,
    username,
    content,
    timestamp: new Date().toISOString(),
    edited: false
  };
  messages.push(newMessage);
  saveMessages(messages);
  return newMessage;
}

function updateMessage(messageId, content) {
  const messages = loadMessages();
  const index = messages.findIndex(m => m.id === messageId);
  
  if (index === -1) {
    throw new Error('Message not found');
  }

  messages[index] = {
    ...messages[index],
    content,
    edited: true,
    editedAt: new Date().toISOString()
  };

  saveMessages(messages);
  return messages[index];
}

function deleteMessage(messageId) {
  const messages = loadMessages();
  const newMessages = messages.filter(m => m.id !== messageId);
  saveMessages(newMessages);
}

function deleteAllMessages() {
  saveMessages([]);
}

function searchMessages(query) {
  const messages = loadMessages();
  const lowercaseQuery = query.toLowerCase();
  
  return messages.filter(message => 
    message.content.toLowerCase().includes(lowercaseQuery) ||
    message.username.toLowerCase().includes(lowercaseQuery)
  );
}

module.exports = {
  loadMessages,
  saveMessages,
  findMessageById,
  addMessage,
  updateMessage,
  deleteMessage,
  deleteAllMessages,
  searchMessages
};