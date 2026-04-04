// Toast notifications
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// API fetch wrapper
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
}

// Populate a <select> from an API endpoint
async function populateSelect(selectId, url, valueField, labelField, placeholder = '-- Sélectionner --') {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = `<option value="">${placeholder}</option>`;
  try {
    const data = await apiFetch(url);
    data.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item[valueField];
      opt.textContent = item[labelField];
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error(`populateSelect(${selectId}):`, e.message);
  }
}

// Mark active nav link
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
});
