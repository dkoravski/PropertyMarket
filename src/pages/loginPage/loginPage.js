import { supabase } from '../../services/supabaseClient/supabaseClient.js';
import { showPageFeedback } from '../../utils/ui.js';

export function createLoginPage() {
  setTimeout(() => {
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', handleLogin);
    }
  }, 0);

  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-4">Вход</h1>
      <form class="row g-3" novalidate>
        <div class="col-12">
          <label for="email" class="form-label">Имейл</label>
          <input id="email" type="email" class="form-control" placeholder="Въведете имейл" required />
        </div>
        <div class="col-12">
          <label for="password" class="form-label">Парола</label>
          <input id="password" type="password" class="form-control" placeholder="Въведете парола" required />
          <div class="text-end mt-1">
            <a href="#/forgot-password" class="small text-decoration-none">Забравихте паролата?</a>
          </div>
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-primary w-100">Влез</button>
        </div>
        <div class="col-12 text-center">
          <p class="small mb-0">Нямате профил? <a href="#/register">Регистрирайте се тук</a></p>
        </div>
      </form>
    </section>
  `;
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Влизане...';

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check profile for role and active status
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', data.user.id)
      .single();

    // Block deactivated users
    if (profile?.is_active === false) {
      await supabase.auth.signOut();
      showPageFeedback('danger', 'Акаунтът ви е деактивиран. Свържете се с администратор.');
      return;
    }

    // Save auth state for router
    localStorage.setItem('pm_is_authenticated', 'true');
    if (profile?.role) {
      localStorage.setItem('pm_user_role', profile.role);
    }

    // Redirect
    window.location.hash = '#/';
    window.location.reload(); 
    
  } catch (err) {
    console.error('Login error:', err);
    showPageFeedback('danger', translateLoginError(err.message));
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Влез';
  }
}

function translateLoginError(message) {
  const msg = (message || '').toLowerCase();

  if (msg.includes('invalid login credentials')) {
    return 'Грешка при вход: Невалиден имейл или парола.';
  }

  if (msg.includes('email not confirmed')) {
    return 'Грешка при вход: Моля, потвърдете имейла си преди вход.';
  }

  if (msg.includes('too many requests')) {
    return 'Грешка при вход: Твърде много опити. Опитайте отново след малко.';
  }

  return 'Грешка при вход: ' + (message || 'Възникна неочаквана грешка.');
}
