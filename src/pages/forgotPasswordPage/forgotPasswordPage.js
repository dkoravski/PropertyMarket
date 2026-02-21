import { supabase } from '../../services/supabaseClient/supabaseClient.js';
import { showPageFeedback } from '../../utils/ui.js';

export function createForgotPasswordPage() {
  setTimeout(() => {
    const form = document.getElementById('forgot-password-form');
    if (form) form.addEventListener('submit', handleForgotPassword);
  }, 0);

  return `
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-5">
        <section class="auth-surface rounded-4 p-4 p-md-5 bg-white border shadow-sm">
          <div class="mb-4">
            <button onclick="history.back()" class="btn btn-outline-secondary btn-sm">
              <i class="bi bi-arrow-left me-1"></i>Назад
            </button>
          </div>
          <div class="text-center mb-4">
            <i class="bi bi-shield-lock text-primary" style="font-size: 3rem;"></i>
            <h1 class="h3 fw-bold mt-3 mb-1">Забравена парола</h1>
            <p class="text-secondary small">Въведете имейла си и ще ви изпратим линк за нулиране на паролата.</p>
          </div>
          <form id="forgot-password-form" class="row g-3" novalidate>
            <div class="col-12">
              <label for="forgot-email" class="form-label fw-semibold">Имейл адрес</label>
              <input id="forgot-email" type="email" class="form-control" placeholder="Въведете вашия имейл" required />
            </div>
            <div class="col-12 mt-2">
              <button type="submit" id="forgot-submit-btn" class="btn btn-primary w-100 fw-bold">
                <span class="spinner-border spinner-border-sm d-none me-2" id="forgot-spinner" role="status" aria-hidden="true"></span>
                <span id="forgot-btn-text">Изпрати линк за нулиране</span>
              </button>
            </div>
            <div class="col-12 text-center">
              <p class="small text-secondary mb-0">Нямате профил? <a href="#/register">Регистрирайте се</a></p>
            </div>
          </form>
        </section>
      </div>
    </div>
  `;
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim();
  const submitBtn = document.getElementById('forgot-submit-btn');
  const spinner = document.getElementById('forgot-spinner');
  const btnText = document.getElementById('forgot-btn-text');

  try {
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    btnText.textContent = 'Изпращане...';

    const redirectTo = `${window.location.origin}${window.location.pathname}`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;

    showPageFeedback('success', 'Линкът за нулиране е изпратен. Проверете входяща поща и папка Спам/Нежелана поща. Писмото може да пристигне до няколко минути.');
    document.getElementById('forgot-password-form').reset();

  } catch (err) {
    console.error('Forgot password error:', err);
    showPageFeedback('danger', translateForgotPasswordError(err.message));
  } finally {
    submitBtn.disabled = false;
    spinner.classList.add('d-none');
    btnText.textContent = 'Изпрати линк за нулиране';
  }
}

function translateForgotPasswordError(message) {
  const msg = (message || '').toLowerCase();

  if (msg.includes('unable to validate email address') || msg.includes('invalid email')) {
    return 'Грешка: Невалиден имейл адрес.';
  }

  if (msg.includes('email rate limit exceeded') || msg.includes('too many requests')) {
    return 'Грешка: Твърде много заявки. Опитайте отново след малко.';
  }

  if (msg.includes('for security purposes')) {
    return 'Грешка: Моля, изчакайте малко преди следващ опит.';
  }

  return 'Грешка: ' + (message || 'Възникна неочаквана грешка.');
}
