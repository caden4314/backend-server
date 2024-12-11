const path = require('path');
const geoip = require('geoip-lite');
const { readJsonFile, writeJsonFile } = require('./fileSystem');

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
const bannedUsersFilePath = path.join(__dirname, '..', 'data', 'banned.json');

function loadUsers() {
    try {
        return readJsonFile(usersFilePath, []);
    } catch (error) {
        console.error('Error loading users:', error);
        throw { status: 500, message: 'Failed to load users' };
    }
}

function saveUsers(users) {
    try {
        return writeJsonFile(usersFilePath, users);
    } catch (error) {
        console.error('Error saving users:', error);
        throw { status: 500, message: 'Failed to save users' };
    }
}

function findUserById(id) {
    try {
        const users = loadUsers();
        const user = users.find((u) => u.id === id);
        if (!user) {
            console.error(`User not found with ID: ${id}`);
        }
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
        throw { status: 500, message: 'Failed to find user' };
    }
}

function findUserByUsername(username) {
    try {
        const users = loadUsers();
        return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    } catch (error) {
        console.error('Error finding user:', error);
        throw { status: 500, message: 'Failed to find user' };
    }
}

function findUsersByPartialName(partialName) {
    try {
        if (!partialName || partialName.length < 2) return [];
        
        const users = loadUsers();
        const searchTerm = partialName.toLowerCase();
        
        return users
            .filter(user => user.username.toLowerCase().includes(searchTerm))
            .slice(0, 5); // Limit to 5 suggestions
    } catch (error) {
        console.error('Error finding users by partial name:', error);
        throw { status: 500, message: 'Failed to search users' };
    }
}

function createUser(username, ip) {
    try {
        if (isUserBanned(username, ip)) {
            throw { status: 403, message: 'This account has been banned' };
        }

        let users = loadUsers();
        let user = findUserByUsername(username);

        if (user) {
            // Update existing user
            user.lastLogin = new Date().toISOString();
            user.ip = ip;
            saveUsers(users);
            return user;
        }

        // Create new user
        const userId = Date.now().toString();
        let geo = null;
        
        try {
            geo = geoip.lookup(ip);
        } catch (error) {
            console.warn('GeoIP lookup failed:', error.message);
        }

        user = {
            id: userId,
            username,
            role: users.length === 0 ? 'admin' : 'user',
            ip,
            location: geo ? {
                country: geo.country,
                region: geo.region,
                city: geo.city
            } : null,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        users.push(user);
        saveUsers(users);
        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.status) throw error;
        throw { status: 500, message: 'Failed to create user' };
    }
}

function updateUserLogin(userId) {
    try {
        const users = loadUsers();
        const index = users.findIndex(u => u.id === userId);
        
        if (index === -1) {
            throw { status: 404, message: 'User not found' };
        }

        users[index].lastLogin = new Date().toISOString();
        saveUsers(users);
        return users[index];
    } catch (error) {
        console.error('Error updating user login:', error);
        if (error.status) throw error;
        throw { status: 500, message: 'Failed to update user login' };
    }
}

function updateUser(userId, updates) {
    try {
        const users = loadUsers();
        const index = users.findIndex(u => u.id === userId);
        
        if (index === -1) {
            throw { status: 404, message: 'User not found' };
        }

        const { id, createdAt, ip, location, ...allowedUpdates } = updates;
        users[index] = { ...users[index], ...allowedUpdates };
        saveUsers(users);
        return users[index];
    } catch (error) {
        console.error('Error updating user:', error);
        if (error.status) throw error;
        throw { status: 500, message: 'Failed to update user' };
    }
}

function deleteUser(userId) {
    try {
        const users = loadUsers();
        const filteredUsers = users.filter(u => u.id !== userId);
        
        if (filteredUsers.length === users.length) {
            throw { status: 404, message: 'User not found' };
        }

        saveUsers(filteredUsers);
    } catch (error) {
        console.error('Error deleting user:', error);
        if (error.status) throw error;
        throw { status: 500, message: 'Failed to delete user' };
    }
}

function isUserBanned(username, ip) {
    try {
        const bannedUsers = readJsonFile(bannedUsersFilePath, []);
        return bannedUsers.some(ban => 
            ban.username.toLowerCase() === username.toLowerCase() ||
            (ip && ban.ip === ip)
        );
    } catch (error) {
        console.error('Error checking ban status:', error);
        return false;
    }
}

function banUser(username) {
    try {
        const user = findUserByUsername(username);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        if (user.role === 'admin') {
            throw { status: 403, message: 'Cannot ban admin users' };
        }

        const bannedUsers = readJsonFile(bannedUsersFilePath, []);
        if (bannedUsers.some(ban => ban.username.toLowerCase() === username.toLowerCase())) {
            throw { status: 400, message: 'User is already banned' };
        }

        bannedUsers.push({
            username: user.username,
            ip: user.ip,
            bannedAt: new Date().toISOString()
        });

        writeJsonFile(bannedUsersFilePath, bannedUsers);

        // Remove user from active users
        const users = loadUsers();
        const filteredUsers = users.filter(u => u.id !== user.id);
        saveUsers(filteredUsers);

        return user;
    } catch (error) {
        console.error('Error banning user:', error);
        if (error.status) throw error;
        throw { status: 500, message: 'Failed to ban user' };
    }
}

module.exports = {
    loadUsers,
    saveUsers,
    findUserById,
    findUserByUsername,
    findUsersByPartialName,
    createUser,
    updateUser,
    updateUserLogin,
    deleteUser,
    banUser,
    isUserBanned
};