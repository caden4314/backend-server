const express = require('express');
const router = express.Router();
const { loadMessages, addMessage, updateMessage, deleteMessage, findMessageById } = require('../utils/messageManager');
const { createApiResponse, handleApiError } = require('../utils/apiUtils');

router.get('/messages', (req, res) => {
  try {
    console.log('Loading messages');
    const messages = loadMessages();
    console.log(`Loaded ${messages.length} messages`);
    res.json(createApiResponse(messages));
  } catch (error) {
    console.error('Error loading messages:', error);
    handleApiError(res, error);
  }
});

router.post('/messages', (req, res) => {
  try {
    const { content } = req.body;
    const user = req.user;
    
    if (!content) {
      throw { status: 400, message: 'Content is required' };
    }

    // Don't save messages that start with /
    if (content.startsWith('/')) {
      return res.json(createApiResponse(null, 'Command processed'));
    }

    console.log(`Adding message from user ${user.username}`);
    const message = addMessage(user.id, user.username, content);
    res.json(createApiResponse(message, 'Message sent successfully'));
  } catch (error) {
    console.error('Error adding message:', error);
    handleApiError(res, error);
  }
});

router.put('/messages/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    console.log(`Updating message ${id} from user ${user.username}`);

    if (!content) {
      throw { status: 400, message: 'Content is required' };
    }

    // Don't allow updating to a command
    if (content.startsWith('/')) {
      throw { status: 400, message: 'Invalid message content' };
    }

    const message = findMessageById(id);
    if (!message) {
      throw { status: 404, message: 'Message not found' };
    }

    if (message.userId !== user.id && user.role !== 'admin') {
      throw { status: 403, message: 'Not authorized to edit this message' };
    }

    const updatedMessage = updateMessage(id, content);
    console.log('Message updated successfully:', updatedMessage);
    res.json(createApiResponse(updatedMessage, 'Message updated successfully'));
  } catch (error) {
    console.error('Error updating message:', error);
    handleApiError(res, error);
  }
});

router.delete('/messages/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log(`Deleting message ${id} by user ${user.username}`);

    const message = findMessageById(id);
    if (!message) {
      throw { status: 404, message: 'Message not found' };
    }

    if (message.userId !== user.id && user.role !== 'admin') {
      throw { status: 403, message: 'Not authorized to delete this message' };
    }

    deleteMessage(id);
    res.json(createApiResponse(null, 'Message deleted successfully'));
  } catch (error) {
    console.error('Error deleting message:', error);
    handleApiError(res, error);
  }
});

module.exports = router;