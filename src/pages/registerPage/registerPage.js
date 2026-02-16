import { supabase } from '../../services/supabaseClient/supabaseClient.js';

export function createRegisterPage() {
  setTimeout(() => {
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', handleRegister);
    }
  }, 0);

  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-4">Регистрация</h1>
      <form class="row g-3" novalidate>
        <div class="col-12">
          <label for="register-email" class="form-label">Имейл</label>
          <input id="register-email" type="email" class="form-control" placeholder="Въведете имейл" required />
        </div>
        <div class="col-12">
          <label for="register-password" class="form-label">Парола</label>
          <input id="register-password" type="password" class="form-control" placeholder="Създайте парола" required minlength="6" />
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-primary w-100">Създай профил</button>
        </div>
        <div class="col-12 text-center">
          <p class="small mb-0">Вече имате профил? <a href="#/login">Влезте тук</a></p>
        </div>
      </form>
    </section>
  `;
}

async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Регистриране...';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    alert('Регистрацията успешна! Моля, потвърдете имейла си или влезте в системата.');
    window.location.hash = '#/login';
    
  } catch (err) {
    console.error('Registration error:', err);
    alert('Грешка при регистрация: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Създай профил';
  }
}
