import { signIn, autoLogin } from './api.js';

const form = document.getElementById('signin-form');
const message = document.getElementById('message');
const submitBtn = document.getElementById('submit-btn');
const usernameInput = document.getElementById('username');

function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.innerHTML = '<span class="loading"></span>Signing in...';
    submitBtn.disabled = true;
    usernameInput.disabled = true;
  } else {
    submitBtn.innerHTML = 'Sign In';
    submitBtn.disabled = false;
    usernameInput.disabled = false;
  }
}

function showMessage(text, type = 'error') {
  message.textContent = text;
  message.className = type;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();

  if (!username) {
    showMessage('Please enter a username.');
    return;
  }

  try {
    setLoading(true);
    const data = await signIn(username);
    localStorage.setItem('userId', data.id);
    showMessage('Sign in successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/home';
    }, 500);
  } catch (error) {
    showMessage(error.message || 'An error occurred. Please try again.');
    setLoading(false);
  }
});

window.onload = async () => {
  const userId = localStorage.getItem('userId');

  if (userId) {
    try {
      setLoading(true);
      await autoLogin(userId);
      window.location.href = '/home';
    } catch (error) {
      showMessage('Session expired. Please sign in again.');
      localStorage.removeItem('userId');
      setLoading(false);
    }
  }
};

// Add input animations
usernameInput.addEventListener('focus', () => {
  usernameInput.parentElement.style.transform = 'translateY(-2px)';
});

usernameInput.addEventListener('blur', () => {
  usernameInput.parentElement.style.transform = 'translateY(0)';
});