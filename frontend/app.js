const API_BASE = ""; // same origin; adjust if backend is hosted elsewhere

let currentUser = null;

function showSections() {
  const walletSec = document.getElementById('wallet-section');
  const tradeSec = document.getElementById('trade-section');
  if (currentUser) {
    walletSec.style.display = 'block';
    tradeSec.style.display = 'block';
  } else {
    walletSec.style.display = 'none';
    tradeSec.style.display = 'none';
  }
}

async function registerUser() {
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const msgEl = document.getElementById('register-message');
  msgEl.textContent = '';
  try {
    const resp = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await resp.json();
    if (resp.ok) {
      msgEl.textContent = data.message;
    } else {
      msgEl.textContent = data.error || 'Error';
    }
  } catch (err) {
    msgEl.textContent = 'Network error';
  }
}

async function loginUser() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const msgEl = document.getElementById('login-message');
  msgEl.textContent = '';
  try {
    const resp = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await resp.json();
    if (resp.ok) {
      currentUser = username;
      msgEl.textContent = data.message;
      showSections();
      updateBalance();
    } else {
      msgEl.textContent = data.error || 'Error';
    }
  } catch (err) {
    msgEl.textContent = 'Network error';
  }
}

async function updateBalance() {
  if (!currentUser) return;
  try {
    const resp = await fetch(`${API_BASE}/api/wallet?username=${encodeURIComponent(currentUser)}`);
    const data = await resp.json();
    if (resp.ok) {
      document.getElementById('balance').textContent = Number(data.balance).toFixed(2);
    }
  } catch (err) {
    console.error(err);
  }
}

async function deposit() {
  if (!currentUser) return;
  const amount = document.getElementById('deposit-amount').value;
  const msgEl = document.getElementById('deposit-message');
  msgEl.textContent = '';
  try {
    const resp = await fetch(`${API_BASE}/api/wallet/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser, amount })
    });
    const data = await resp.json();
    if (resp.ok) {
      msgEl.textContent = data.message;
      updateBalance();
    } else {
      msgEl.textContent = data.error || 'Error';
    }
  } catch (err) {
    msgEl.textContent = 'Network error';
  }
}

async function executeTrade() {
  if (!currentUser) return;
  const side = document.getElementById('trade-side').value;
  const amount = document.getElementById('trade-amount').value;
  const msgEl = document.getElementById('trade-message');
  msgEl.textContent = '';
  try {
    const resp = await fetch(`${API_BASE}/api/trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser, side, amount })
    });
    const data = await resp.json();
    if (resp.ok) {
      msgEl.textContent = data.message;
      updateBalance();
    } else {
      msgEl.textContent = data.error || 'Error';
    }
  } catch (err) {
    msgEl.textContent = 'Network error';
  }
}

async function fetchLogs() {
  try {
    const resp = await fetch(`${API_BASE}/api/status`);
    const data = await resp.json();
    if (resp.ok) {
      document.getElementById('logs').textContent = (data.logs || []).join('\n');
    }
  } catch (err) {
    console.error(err);
  }
}

// Event listeners

document.getElementById('register-btn').addEventListener('click', registerUser);
document.getElementById('login-btn').addEventListener('click', loginUser);
document.getElementById('deposit-btn').addEventListener('click', deposit);
document.getElementById('trade-btn').addEventListener('click', executeTrade);

document.getElementById('environment').addEventListener('change', (e) => {
  // placeholder: adjust API_BASE or behaviour based on environment selection
  console.log('Environment selected:', e.target.value);
});

// Initial setup
showSections();
fetchLogs();
setInterval(fetchLogs, 5000);
