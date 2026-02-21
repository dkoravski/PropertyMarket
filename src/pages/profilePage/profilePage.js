import { supabase } from '../../services/supabaseClient/supabaseClient.js';
import { showPageFeedback } from '../../utils/ui.js';

export function createProfilePage() {
  setTimeout(initProfilePage, 0);

  return `
    <div class="container py-4" id="profile-page-container">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <button onclick="history.back()" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>Назад
        </button>
        <button onclick="window.pmLogout && window.pmLogout()" class="btn btn-outline-danger btn-sm">Изход</button>
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
    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4" id="profileTab" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="info-tab" data-bs-toggle="tab" data-bs-target="#info-pane"
          type="button" role="tab" aria-controls="info-pane" aria-selected="true">
          <i class="bi bi-person me-2"></i>Лична информация
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="security-tab" data-bs-toggle="tab" data-bs-target="#security-pane"
          type="button" role="tab" aria-controls="security-pane" aria-selected="false">
          <i class="bi bi-shield-lock me-2"></i>Сигурност
        </button>
      </li>
    </ul>
    <div class="tab-content" id="profileTabContent">
    <div class="tab-pane fade show active" id="info-pane" role="tabpanel" aria-labelledby="info-tab" tabindex="0">
    <form id="profile-form" class="row g-3">
      <div class="col-md-6">
        <label class="form-label text-secondary small text-uppercase fw-bold">Имейл адрес</label>
        <input type="text" class="form-control bg-light" value="${user.email}" disabled readonly>
        <div class="form-text">Имейл адресът не може да бъде променян.</div>
      </div>
      
      <div class="col-md-6">
        <label class="form-label text-secondary small text-uppercase fw-bold">Роля</label>
        <input type="text" class="form-control bg-light" value="${profile.role === 'admin' ? 'Администратор' : 'Потребител'}" disabled readonly>
      </div>

      <div class="col-md-6">
        <label for="profile-name" class="form-label fw-bold">Име и Фамилия</label>
        <input type="text" class="form-control" id="profile-name" value="${profile.full_name || ''}" placeholder="Въведете вашето име">
      </div>

      <div class="col-md-6">
        <label for="profile-phone" class="form-label fw-bold">Телефон</label>
        <input type="tel" class="form-control" id="profile-phone" value="${profile.phone || ''}" placeholder="+359...">
      </div>

      <div class="col-12 mt-2 text-end">
        <button type="submit" class="btn btn-primary px-4 fw-bold">
          <span class="spinner-border spinner-border-sm d-none" id="save-spinner" role="status" aria-hidden="true"></span>
          Запази промените
        </button>
      </div>
    </form>
    </div>

    <!-- Tab 2: Сигурност -->
    <div class="tab-pane fade" id="security-pane" role="tabpanel" aria-labelledby="security-tab" tabindex="0">
      <div class="row justify-content-start">
        <div class="col-lg-7">
          <p class="text-secondary small mb-4">Изберете силна парола от поне 6 символа.</p>
          <form id="change-password-form" class="row g-3" novalidate>
            <div class="col-12">
              <label for="new-password" class="form-label fw-semibold">Нова парола</label>
              <div class="input-group">
                <input type="password" id="new-password" class="form-control" placeholder="Минимум 6 символа" minlength="6" required />
                <button class="btn btn-outline-secondary" type="button" id="toggle-new-pass"><i class="bi bi-eye"></i></button>
              </div>
            </div>
            <div class="col-12">
              <label for="confirm-password" class="form-label fw-semibold">Потвърди паролата</label>
              <div class="input-group">
                <input type="password" id="confirm-password" class="form-control" placeholder="Повторете паролата" minlength="6" required />
                <button class="btn btn-outline-secondary" type="button" id="toggle-confirm-pass"><i class="bi bi-eye"></i></button>
              </div>
            </div>
            <div class="col-12 mt-2">
              <button type="submit" id="change-pass-btn" class="btn btn-primary fw-bold px-4">
                <span class="spinner-border spinner-border-sm d-none me-2" id="pass-spinner" role="status" aria-hidden="true"></span>
                <span id="change-pass-text">Смени паролата</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  `;

  const form = container.querySelector('#profile-form');
  form.addEventListener('submit', (e) => handleProfileSave(e, user.id));

  // Toggle password visibility
  const toggleBtn = (inputId, btnId) => {
    document.getElementById(btnId).addEventListener('click', () => {
      const input = document.getElementById(inputId);
      const btn = document.getElementById(btnId);
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.innerHTML = `<i class="bi bi-eye${isPass ? '-slash' : ''}"></i>`;
    });
  };
  toggleBtn('new-password', 'toggle-new-pass');
  toggleBtn('confirm-password', 'toggle-confirm-pass');

  document.getElementById('change-password-form').addEventListener('submit', handleChangePassword);
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

async function handleChangePassword(e) {
  e.preventDefault();
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;
  const btn = document.getElementById('change-pass-btn');
  const spinner = document.getElementById('pass-spinner');
  const btnText = document.getElementById('change-pass-text');

  if (newPass !== confirmPass) {
    showPageFeedback('danger', 'Паролите не съвпадат.');
    return;
  }
  if (newPass.length < 6) {
    showPageFeedback('danger', 'Паролата трябва да е поне 6 символа.');
    return;
  }

  try {
    btn.disabled = true;
    spinner.classList.remove('d-none');
    btnText.textContent = 'Смяна...';

    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;

    showPageFeedback('success', 'Паролата е сменена успешно!');
    document.getElementById('change-password-form').reset();
  } catch (err) {
    console.error('Change password error:', err);
    const msg = translatePasswordError(err.message);
    showPageFeedback('danger', msg);
  } finally {
    btn.disabled = false;
    spinner.classList.add('d-none');
    btnText.textContent = 'Смени паролата';
  }
}
function translatePasswordError(message) {
  if (!message) return 'Възникна грешка.';
  const m = message.toLowerCase();
  if (m.includes('different from the old password')) return 'Новата парола трябва да е различна от старата.';
  if (m.includes('password should be at least')) return 'Паролата трябва да е поне 6 символа.';
  if (m.includes('weak password')) return 'Паролата е твърде слаба. Изберете по-сигурна парола.';
  if (m.includes('auth session missing') || m.includes('not authenticated')) return 'Сесията е изтекла. Моля, влезте отново.';
  return 'Грешка: ' + message;
}