import { supabase } from '../../services/supabaseClient/supabaseClient.js';
import { showPageFeedback } from '../../utils/ui.js';

export function createResetPasswordPage() {
  setTimeout(initResetPage, 0);

  return `
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-5">
        <section class="rounded-4 p-4 p-md-5 bg-white border shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <button onclick="history.back()" class="btn btn-outline-secondary btn-sm">
              <i class="bi bi-arrow-left me-1"></i>Назад
            </button>
            <button onclick="window.pmLogout && window.pmLogout()" class="btn btn-outline-danger btn-sm">Изход</button>
          </div>
          <div class="text-center mb-4">
            <i class="bi bi-key text-primary" style="font-size: 3rem;"></i>
            <h1 class="h3 fw-bold mt-3 mb-1">Нова парола</h1>
            <p class="text-secondary small">Въведете новата си парола.</p>
          </div>
          <div id="reset-password-content">
            <div class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Зареждане...</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}

async function initResetPage() {
  const content = document.getElementById('reset-password-content');
  if (!content) return;

  // Poll for a valid session — Supabase processes the recovery tokens asynchronously
  // so getSession() may return null on the first call. Retry for up to 10 seconds.
  const session = await waitForSession(20, 500);

  const c = document.getElementById('reset-password-content');
  if (!c) return;

  if (!session) {
    c.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        Невалиден или изтекъл линк за нулиране на парола.
      </div>
      <a href="#/forgot-password" class="btn btn-primary w-100">Заяви нов линк</a>
    `;
    return;
  }

  renderResetForm(c);
}

async function waitForSession(maxAttempts = 20, intervalMs = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return null;
}

function renderResetForm(content) {
  content.innerHTML = `
    <form id="reset-password-form" class="row g-3" novalidate>
      <div class="col-12">
        <label for="new-password" class="form-label fw-semibold">Нова парола</label>
        <div class="input-group">
          <input id="new-password" type="password" class="form-control" placeholder="Минимум 6 символа" required minlength="6" />
          <button class="btn btn-outline-secondary" type="button" id="toggle-new-pass">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </div>
      <div class="col-12">
        <label for="confirm-password" class="form-label fw-semibold">Потвърди парола</label>
        <div class="input-group">
          <input id="confirm-password" type="password" class="form-control" placeholder="Повторете паролата" required minlength="6" />
          <button class="btn btn-outline-secondary" type="button" id="toggle-confirm-pass">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </div>
      <div class="col-12 mt-2">
        <button type="submit" id="reset-submit-btn" class="btn btn-primary w-100 fw-bold">
          <span class="spinner-border spinner-border-sm d-none me-2" id="reset-spinner" role="status" aria-hidden="true"></span>
          <span id="reset-btn-text">Запази новата парола</span>
        </button>
      </div>
    </form>
  `;

  // Toggle password visibility
  document.getElementById('toggle-new-pass').addEventListener('click', () => toggleVisibility('new-password', 'toggle-new-pass'));
  document.getElementById('toggle-confirm-pass').addEventListener('click', () => toggleVisibility('confirm-password', 'toggle-confirm-pass'));

  document.getElementById('reset-password-form').addEventListener('submit', handleResetPassword);
}

async function handleResetPassword(e) {
  e.preventDefault();
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;
  const submitBtn = document.getElementById('reset-submit-btn');
  const spinner = document.getElementById('reset-spinner');
  const btnText = document.getElementById('reset-btn-text');

  if (newPass !== confirmPass) {
    showPageFeedback('danger', 'Паролите не съвпадат.');
    return;
  }
  if (newPass.length < 6) {
    showPageFeedback('danger', 'Паролата трябва да е поне 6 символа.');
    return;
  }

  try {
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    btnText.textContent = 'Запазване...';

    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;

    showPageFeedback('success', 'Паролата е сменена успешно!');
    setTimeout(() => { window.location.hash = '#/login'; }, 2000);

  } catch (err) {
    console.error('Reset password error:', err);
    showPageFeedback('danger', translateResetPasswordError(err.message));
  } finally {
    submitBtn.disabled = false;
    spinner.classList.add('d-none');
    btnText.textContent = 'Запази новата парола';
  }
}

function toggleVisibility(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  btn.innerHTML = `<i class="bi bi-eye${isPass ? '-slash' : ''}"></i>`;
}

function translateResetPasswordError(message) {
  const msg = (message || '').toLowerCase();

  if (msg.includes('different from the old password')) {
    return 'Грешка: Новата парола трябва да е различна от старата.';
  }

  if (msg.includes('password should be at least')) {
    return 'Грешка: Паролата трябва да е поне 6 символа.';
  }

  if (msg.includes('auth session missing') || msg.includes('session_not_found')) {
    return 'Грешка: Сесията е изтекла. Заявете нов линк за нулиране.';
  }

  if (msg.includes('invalid token') || msg.includes('token has expired')) {
    return 'Грешка: Линкът за нулиране е невалиден или изтекъл.';
  }

  if (msg.includes('too many requests')) {
    return 'Грешка: Твърде много опити. Опитайте отново след малко.';
  }

  return 'Грешка: ' + (message || 'Възникна неочаквана грешка.');
}
