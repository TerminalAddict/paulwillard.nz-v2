import { Workbox } from 'https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-window.prod.mjs';

const updateMessage = 'A new version of paulwillard.nz is available.';

function createUpdatePrompt(onAccept) {
  const existingPrompt = document.querySelector('.site-update-toast');
  if (existingPrompt) return;

  const prompt = document.createElement('div');
  prompt.className = 'site-update-toast';
  prompt.setAttribute('role', 'status');
  prompt.innerHTML = `
    <div>
      <strong>Site updated</strong>
      <span>${updateMessage}</span>
    </div>
    <button class="site-update-action" type="button">Update</button>
    <button class="site-update-dismiss" type="button" aria-label="Dismiss update notice">&times;</button>
  `;

  prompt.querySelector('.site-update-action').addEventListener('click', onAccept);
  prompt.querySelector('.site-update-dismiss').addEventListener('click', () => prompt.remove());
  document.body.appendChild(prompt);
}

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');

  wb.addEventListener('waiting', () => {
    createUpdatePrompt(() => {
      wb.addEventListener('controlling', () => {
        window.location.reload();
      });
      wb.messageSW({ type: 'SKIP_WAITING' });
    });
  });

  wb.register().catch(() => {
    console.log('Service worker registration failed.');
  });
}
