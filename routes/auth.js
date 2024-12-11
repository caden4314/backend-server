const express = require('express');
const router = express.Router();
const { findUserById, createUser, updateUserLogin } = require('../utils/userManager');
const { createApiResponse } = require('../utils/apiUtils');

router.post('/signin', (req, res) => {
  const { username } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  if (!username) {
    return res.status(400).json({ 
      success: false,
      message: 'Username is required' 
    });
  }

  try {
    const user = createUser(username, ip);
    res.json(createApiResponse({ 
      id: user.id, 
      username: user.username,
      role: user.role 
    }));
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to sign in'
    });
  }
});

router.get('/autologin/:id', (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (user.id !== id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  try {
    const updatedUser = updateUserLogin(id);
    res.json(createApiResponse({ 
      id: updatedUser.id, 
      username: updatedUser.username,
      role: updatedUser.role 
    }));
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to auto-login'
    });
  }
});

module.exports = router;