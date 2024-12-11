const express = require('express');
const router = express.Router();
const { loadUsers, updateUser, deleteUser, searchUsers, findUserById } = require('../utils/userManager');
const { loadMessages, deleteMessage, searchMessages, deleteAllMessages } = require('../utils/messageManager');
const { getUserRecords } = require('../utils/userRecords');
const { isAdmin } = require('../middleware/auth');
const { handleApiError, createApiResponse } = require('../utils/apiUtils');

// Get all user records
router.get('/admin/records', isAdmin, (req, res) => {
    try {
        const users = loadUsers();
        const records = {};
        
        users.forEach(user => {
            const userRecords = getUserRecords(user.id);
            if (Object.values(userRecords).some(arr => arr.length > 0)) {
                records[user.id] = userRecords;
            }
        });
        
        res.json(createApiResponse(records));
    } catch (error) {
        console.error('Error loading user records:', error);
        handleApiError(res, error);
    }
});

// Get records for a specific user
router.get('/admin/records/:userId', isAdmin, (req, res) => {
    try {
        const records = getUserRecords(req.params.userId);
        res.json(createApiResponse(records));
    } catch (error) {
        console.error('Error loading user records:', error);
        handleApiError(res, error);
    }
});

// Get single user
router.get('/admin/users/:id', isAdmin, (req, res) => {
    try {
        const user = findUserById(req.params.id);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
        res.json(createApiResponse(user));
    } catch (error) {
        handleApiError(res, error);
    }
});

// Get all users
router.get('/admin/users', isAdmin, (req, res) => {
    try {
        const users = loadUsers();
        res.json(createApiResponse(users));
    } catch (error) {
        handleApiError(res, error);
    }
});

// Get all messages
router.get('/admin/messages', isAdmin, (req, res) => {
    try {
        const messages = loadMessages();
        res.json(createApiResponse(messages));
    } catch (error) {
        handleApiError(res, error);
    }
});

// Update user
router.put('/admin/users/:id', isAdmin, (req, res) => {
    try {
        const user = updateUser(req.params.id, req.body);
        res.json(createApiResponse(user, 'User updated successfully'));
    } catch (error) {
        handleApiError(res, error);
    }
});

// Delete user
router.delete('/admin/users/:id', isAdmin, (req, res) => {
    try {
        deleteUser(req.params.id);
        res.json(createApiResponse(null, 'User deleted successfully'));
    } catch (error) {
        handleApiError(res, error);
    }
});

// Delete message
router.delete('/admin/messages/:id', isAdmin, (req, res) => {
    try {
        deleteMessage(req.params.id);
        res.json(createApiResponse(null, 'Message deleted successfully'));
    } catch (error) {
        handleApiError(res, error);
    }
});

// Delete all messages
router.delete('/admin/messages', isAdmin, (req, res) => {
    try {
        deleteAllMessages();
        res.json(createApiResponse(null, 'All messages deleted successfully'));
    } catch (error) {
        handleApiError(res, error);
    }
});

module.exports = router;