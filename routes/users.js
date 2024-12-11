const express = require('express');
const router = express.Router();
const { findUsersByPartialName } = require('../utils/userManager');
const { isAdmin } = require('../middleware/auth');
const { createApiResponse, handleApiError } = require('../utils/apiUtils');

router.get('/users/search', isAdmin, (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) {
            return res.json(createApiResponse([]));
        }
        
        const users = findUsersByPartialName(query);
        res.json(createApiResponse(users.map(user => ({
            id: user.id,
            username: user.username,
            role: user.role
        }))));
    } catch (error) {
        console.error('Error searching users:', error);
        handleApiError(res, error);
    }
});

module.exports = router;