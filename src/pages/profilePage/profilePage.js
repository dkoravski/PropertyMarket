import { supabase } from '../../services/supabaseClient/supabaseClient.js';
import { render } from '../../utils/render/render.js';

export function createProfilePage() {
  // Use a timeout to ensure the DOM is ready before we try to manipulate it or fetch data
  setTimeout(initProfilePage, 0);

  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 fw-bold mb-0">Моят Профил</h1>
        <button id="logout-btn" class="btn btn-outline-danger btn-sm">Изход</button>
      </div>
      
      <div id="profile-content">
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Зареждане...</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

async function initProfilePage() {
  const contentContainer = document.getElementById('profile-content');
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.hash = '#/login';
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    renderProfileForm(contentContainer, profile);

  } catch (err) {
    console.error('Profile fetch error:', err);
    contentContainer.innerHTML = `
      <div class="alert alert-danger">
        Възникна грешка при зареждане на профила: ${err.message}
      </div>
    `;
  }
}

function renderProfileForm(container, profile) {
  container.innerHTML = `
    <form id="profile-form" class="row g-3">
      <div class="col-md-6">
        <label for="profile-email" class="form-label">Имейл</label>
        <input type="email" class="form-control" id="profile-email" value="${profile.email || ''}" disabled readonly>
        <div class="form-text">Имейл адресът не може да се променя.</div>
      </div>
      <div class="col-md-6">
        <label for="profile-role" class="form-label">Роля</label>
        <input type="text" class="form-control" id="profile-role" value="${profile.role === 'admin' ? 'Администратор' : 'Потребител'}" disabled readonly>
      </div>
      
      <div class="col-12">
        <label for="profile-name" class="form-label">Име и Фамилия</label>
        <input type="text" class="form-control" id="profile-name" value="${profile.full_name || ''}" placeholder="Вашето име">
      </div>
      
      <div class="col-12">
        <label for="profile-phone" class="form-label">Телефон</label>
        <input type="tel" class="form-control" id="profile-phone" value="${profile.phone || ''}" placeholder="+359...">
      </div>
      
      <div class="col-12 mt-4">
        <button type="submit" class="btn btn-primary d-flex align-items-center gap-2">
          <span>Запиши промените</span>
          <div id="save-spinner" class="spinner-border spinner-border-sm d-none" role="status"></div>
        </button>
      </div>
    </form>
  `;

  document.getElementById('profile-form').addEventListener('submit', (e) => handleUpdateProfile(e, profile.id));
}

async function handleUpdateProfile(e, userId) {
  e.preventDefault();
  
  const nameInput = document.getElementById('profile-name');
  const phoneInput = document.getElementById('profile-phone');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const spinner = document.getElementById('save-spinner');

  const newFullName = nameInput.value.trim();
  const newPhone = phoneInput.value.trim();

  try {
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');

    const updates = {
      id: userId,
      full_name: newFullName,
      phone: newPhone,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;

    alert('Профилът е обновен успешно!');
    
  } catch (err) {
    console.error('Profile update error:', err);
    alert('Грешка при обновяване: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    spinner.classList.add('d-none');
  }
}

async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    localStorage.removeItem('pm_is_authenticated');
    localStorage.removeItem('pm_user_role');
    
    window.location.hash = '#/';
    window.location.reload();
    
  } catch (err) {
    console.error('Logout error:', err);
    alert('Грешка при изход: ' + err.message);
  }
}
