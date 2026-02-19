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

    // Check profile for role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

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
    showPageFeedback('danger', 'Грешка при вход: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Влез';
  }
}
