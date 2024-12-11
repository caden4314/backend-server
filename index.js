const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const commandRoutes = require('./routes/commands');
const userRoutes = require('./routes/users');
const { authMiddleware } = require('./middleware/auth');
const { handleApiError } = require('./utils/apiUtils');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', authMiddleware);

// Routes
app.use('/api', authRoutes);
app.use('/api', messageRoutes);
app.use('/api', adminRoutes);
app.use('/api', commandRoutes);
app.use('/api', userRoutes);

app.use((err, req, res, next) => {
    handleApiError(res, err);
});

app.get('*', (req, res) => {
    const requestPath = req.path;
    
    if (requestPath === '/home') {
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    } else if (requestPath === '/admin') {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else if (requestPath === '/messages') {
        res.sendFile(path.join(__dirname, 'public', 'messages.html'));
    } else if (requestPath === '/users') {
        res.sendFile(path.join(__dirname, 'public', 'users.html'));
    } else if (requestPath === '/edit-user') {
        res.sendFile(path.join(__dirname, 'public', 'edit-user.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

const dataDir = path.join(__dirname, 'data');
if (!require('fs').existsSync(dataDir)) {
    require('fs').mkdirSync(dataDir, { recursive: true });
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});