const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const usersFilePath = path.join(__dirname, 'users.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

function loadUsers() {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(usersFilePath));
}

function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

app.post('/signin', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  let users = loadUsers();

  let user = users.find((u) => u.username === username);

  if (!user) {
    const userId = Date.now();
    console.log(`Generated ID: ${userId}`);
    user = { id: user, username };
    users.push(user);
    saveUsers(users);
  }

  res.json({ id: user.id, username: user.username });
});

app.get('/autologin/:id', (req, res) => {
  const { id } = req.params;

  const users = loadUsers();
  const user = users.find((u) => u.id == id);

  if (user) {
    res.json({ id: user.id, username: user.username });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
