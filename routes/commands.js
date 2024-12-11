const express = require('express');
const router = express.Router();
const { handleCommand } = require('../utils/botCommands');
const { isAdmin } = require('../middleware/auth');
const { createApiResponse, handleApiError } = require('../utils/apiUtils');

router.post('/commands', isAdmin, (req, res) => {
    try {
        const { command, args } = req.body;
        
        if (!command) {
            throw { status: 400, message: 'Command is required' };
        }

        const result = handleCommand(command, args, req.user);
        res.json(createApiResponse(result, result.message));
    } catch (error) {
        console.error('Error executing command:', error);
        handleApiError(res, error);
    }
});

module.exports = router;