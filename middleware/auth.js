const { findUserById } = require('../utils/userManager');

function authMiddleware(req, res, next) {
  try {
    // Skip auth check for signin route
    if (req.path === '/signin') {
      return next();
    }

    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    const user = findUserById(userId);
    if (!user) {
      console.error(`Auth failed: User not found with ID ${userId}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid authentication' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
}

function isAdmin(req, res, next) {
  try {
    if (!req.user) {
      console.error('Admin check failed: No user in request');
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (req.user.role !== 'admin') {
      console.error(`Admin check failed: User ${req.user.id} is not an admin`);
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
}

module.exports = { authMiddleware, isAdmin };