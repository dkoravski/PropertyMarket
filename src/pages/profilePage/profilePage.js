import { supabase } from '../../services/supabaseClient/supabaseClient.js';
import { showPageFeedback } from '../../utils/ui.js';

export function createProfilePage() {
  setTimeout(initProfilePage, 0);

  return `
    <div class="container py-4" id="profile-page-container">
      <div class="mb-3">
        <button onclick="history.back()" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>Назад
        </button>
      </div>
      <section class="max-w-3xl mx-auto rounded-4 p-4 p-md-5 bg-white border shadow-sm">
        <div class="mb-4 border-bottom pb-3">
          <h1 class="h3 fw-bold mb-0">Моят Профил</h1>
        </div>
        
        <div id="profile-content">
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Зареждане...</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

async function initProfilePage() {
  const container = document.getElementById('profile-page-container');
  if (!container) return;

  const contentContainer = container.querySelector('#profile-content');

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.hash = '#/login';
      return;
    }

    // Load Profile Data
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!profile) {
      // Create if missing (fallback)
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({ id: user.id, email: user.email })
        .select()
        .single();
      
      if (createError) throw createError;
      profile = newProfile;
    }

    renderProfileForm(contentContainer, profile, user);

  } catch (err) {
    console.error('Profile error:', err);
    contentContainer.innerHTML = `<div class="alert alert-danger">Грешка при зареждане на профила: ${err.message}</div>`;
  }
}

function renderProfileForm(container, profile, user) {
  container.innerHTML = `
    <form id="profile-form" class="row g-3">
      <div class="col-md-6">
        <label class="form-label text-secondary small text-uppercase fw-bold">Имейл адрес</label>
        <input type="text" class="form-control bg-white" value="${user.email}" disabled readonly>
        <div class="form-text">Имейл адресът не може да бъде променян.</div>
      </div>
      
      <div class="col-md-6">
        <label class="form-label text-secondary small text-uppercase fw-bold">Роля</label>
        <input type="text" class="form-control bg-white" value="${profile.role === 'admin' ? 'Администратор' : 'Потребител'}" disabled readonly>
      </div>

      <div class="col-md-6">
        <label for="profile-name" class="form-label fw-bold">Име и Фамилия</label>
        <input type="text" class="form-control" id="profile-name" value="${profile.full_name || ''}" placeholder="Въведете вашето име">
      </div>

      <div class="col-md-6">
        <label for="profile-phone" class="form-label fw-bold">Telefon</label>
        <input type="tel" class="form-control" id="profile-phone" value="${profile.phone || ''}" placeholder="+359...">
      </div>

      <div class="col-12 mt-4 text-end">
        <button type="submit" class="btn btn-primary px-4 fw-bold">
          <span class="spinner-border spinner-border-sm d-none" id="save-spinner" role="status" aria-hidden="true"></span>
          Запази промените
        </button>
      </div>
    </form>
  `;

  const form = container.querySelector('#profile-form');
  form.addEventListener('submit', (e) => handleProfileSave(e, user.id));
}

async function handleProfileSave(e, userId) {
  e.preventDefault();
  const form = e.target;
  const nameInput = form.querySelector('#profile-name');
  const phoneInput = form.querySelector('#profile-phone');
  const submitBtn = form.querySelector('button[type="submit"]');
  const spinner = form.querySelector('#save-spinner');

  try {
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');

    const updates = {
      full_name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;

    showPageFeedback('success', 'Профилът е обновен успешно!');
  } catch (err) {
    console.error('Update error:', err);
    showPageFeedback('danger', 'Грешка: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    spinner.classList.add('d-none');
  }
}

// Remove unused functions
// async function loadUserProperties(userId, container) { ... }
// function createMyPropertyCard(property) { ... }
