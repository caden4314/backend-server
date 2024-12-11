const form = document.getElementById('signin-form');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;

  if (!username) {
    message.textContent = 'Please enter a username.';
    return;
  }

  try {
    const responce = await fetch('/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
      .then((response) => responce.json())
      .then((data) => {
        console.log('Received Data:', data);
        localStorage.setItem('userId', data.id);
      });

    const data = await responce.json();

    if (responce.ok) {
      localStorage.setItem('userId', data.id);

      message.textContent = `Welcome, ${data.username}! Your ID: ${data.id}`;
    } else {
      message.textContent = 'An error occurred. Please try again';
    }
  } catch (error) {
    message.textContent = 'An error occurred. Please try again.';
  }
});

window.onload = async () => {
  const userId = localStorage.getItem('userId');

  if (userId) {
    try {
      const response = await fetch(`/autologin/${userId}`);
      const data = await response.json();

      if (response.ok) {
        message.textContent = `Welcome back, ${data.username}!`;
      } else {
        message.textContent = 'User not found. Please sign in.';
        localStorage.removeItem('userId');
      }
    } catch (error) {
      message.textContent = 'Error during auto-login. Please try again.';
    }
  }
};
