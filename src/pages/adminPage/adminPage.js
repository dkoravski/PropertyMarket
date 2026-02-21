import { supabase } from '../../services/supabaseClient/supabaseClient.js';
import { showConfirmModal, showMessageModal } from '../../utils/ui.js';

export function createAdminPage() {
  setTimeout(initAdminPage, 0);

  return `
    <div class="mb-3">
      <button onclick="history.back()" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i>Назад
      </button>
    </div>
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-4">Административен панел</h1>
      
      <ul class="nav nav-tabs mb-4" id="adminTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="users-tab" data-bs-toggle="tab" data-bs-target="#users-pane" type="button" role="tab" aria-controls="users-pane" aria-selected="true">
            Потребители
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="properties-tab" data-bs-toggle="tab" data-bs-target="#properties-pane" type="button" role="tab" aria-controls="properties-pane" aria-selected="false">
            Обяви
          </button>
        </li>
      </ul>

      <div class="tab-content" id="adminTabContent">
        <!-- Users Tab -->
        <div class="tab-pane fade show active" id="users-pane" role="tabpanel" aria-labelledby="users-tab" tabindex="0">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="h5 mb-0">Списък потребители</h4>
            <button id="refresh-users" class="btn btn-sm btn-outline-secondary">
              <i class="bi bi-arrow-clockwise"></i> Обнови
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle bg-white rounded shadow-sm">
              <thead class="table-light">
                <tr>
                  <th>Email</th>
                  <th>Име</th>
                  <th>Роля</th>
                  <th>Регистриран на</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody id="users-table-body">
                <tr><td colspan="5" class="text-center py-4">Зареждане...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Properties Tab -->
        <div class="tab-pane fade" id="properties-pane" role="tabpanel" aria-labelledby="properties-tab" tabindex="0">
           <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="h5 mb-0">Списък обяви</h4>
            <button id="refresh-properties" class="btn btn-sm btn-outline-secondary">
              <i class="bi bi-arrow-clockwise"></i> Обнови
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle bg-white rounded shadow-sm">
              <thead class="table-light">
                <tr>
                  <th>Заглавие</th>
                  <th>Тип</th>
                  <th>Цена</th>
                  <th>Собственик</th>
                  <th>Създадена на</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody id="properties-table-body">
                <tr><td colspan="6" class="text-center py-4">Зареждане...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `;
}

async function initAdminPage() {
  document.getElementById('refresh-users').addEventListener('click', loadUsers);
  document.getElementById('refresh-properties').addEventListener('click', loadProperties);

  // Initial load
  await Promise.all([loadUsers(), loadProperties()]);
}

async function loadUsers() {
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></td></tr>';

  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Няма намерени потребители.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(user => `
      <tr class="${user.is_active === false ? 'table-secondary text-muted' : ''}">
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.full_name || '-')}</td>
        <td>
          <span class="badge ${user.role === 'admin' ? 'text-bg-danger' : 'text-bg-secondary'}">
            ${user.role === 'admin' ? 'Admin' : 'User'}
          </span>
          ${user.is_active === false ? '<span class="badge text-bg-warning ms-1">Деактивиран</span>' : ''}
        </td>
        <td>${new Date(user.created_at).toLocaleDateString()}</td>
        <td>
          ${user.role !== 'admin' ? `
            <button class="btn btn-sm ${user.is_active === false ? 'btn-outline-success' : 'btn-outline-warning'} toggle-user-btn"
              data-id="${user.id}" data-active="${user.is_active !== false}">
              ${user.is_active === false ? '<i class="bi bi-person-check me-1"></i>Активирай' : '<i class="bi bi-person-dash me-1"></i>Деактивирай'}
            </button>
          ` : '<span class="text-muted small">—</span>'}
        </td>
      </tr>
    `).join('');

    // Attach event listeners
    document.querySelectorAll('.toggle-user-btn').forEach(btn => {
      btn.addEventListener('click', () => handleToggleUserActive(btn.dataset.id, btn.dataset.active === 'true'));
    });

  } catch (err) {
    console.error('Error loading users:', err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Грешка при зареждане: ${err.message}</td></tr>`;
  }
}

async function loadProperties() {
  const tbody = document.getElementById('properties-table-body');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></td></tr>';

  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (properties.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Няма намерени обяви.</td></tr>';
      return;
    }

    const typeLabels = {
      apartment: 'Апартамент',
      studio: 'Студио',
      house: 'Къща',
      villa: 'Вила',
      guest_house: 'Къща за гости'
    };

    const listingTypeLabels = {
      sale: 'Продажба',
      rent: 'Наем'
    };

    tbody.innerHTML = properties.map(prop => `
      <tr>
        <td>
          <a href="#/property?id=${prop.id}" class="text-decoration-none fw-semibold text-dark">
            ${escapeHtml(prop.title)}
          </a>
        </td>
        <td>${typeLabels[prop.property_type] || prop.property_type} <span class="text-muted small">(${listingTypeLabels[prop.listing_type]})</span></td>
        <td class="fw-bold text-primary">${prop.price.toLocaleString()} €</td>
        <td>${escapeHtml(prop.profiles?.email || 'Неизвестен')}</td>
        <td>${new Date(prop.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger delete-prop-btn" data-id="${prop.id}">
            Изтрий
          </button>
        </td>
      </tr>
    `).join('');

    // Attach event listeners
    document.querySelectorAll('.delete-prop-btn').forEach(btn => {
      btn.addEventListener('click', (e) => handleDeleteProperty(e.target.dataset.id));
    });

  } catch (err) {
    console.error('Error loading properties:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Грешка при зареждане: ${err.message}</td></tr>`;
  }
}

async function handleDeleteProperty(id) {
  const confirmed = await showConfirmModal('Сигурни ли сте, че искате да изтриете тази обява?');
  if (!confirmed) return;

  try {
    // 1. Delete images from storage first
    const { data: images } = await supabase
      .from('property_images')
      .select('image_url')
      .eq('property_id', id);

    if (images && images.length > 0) {
      const paths = images
        .map(img => {
           const url = img.image_url;
           const token = '/properties/';
           const idx = url.indexOf(token);
           return idx !== -1 ? url.substring(idx + token.length) : null;
        })
        .filter(p => p !== null);

      if (paths.length > 0) {
        // Best effort cleanup
        await supabase.storage.from('properties').remove(paths);
      }
    }

    // 2. Delete property record
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;

    loadProperties(); // Reload list
    await showMessageModal('Обявата беше изтрита успешно.', 'success');
  } catch (err) {
    console.error('Error deleting property:', err);
    await showMessageModal('Грешка при изтриване: ' + err.message, 'error');
  }
}

async function handleToggleUserActive(id, isCurrentlyActive) {
  const action = isCurrentlyActive ? 'деактивирате' : 'активирате';
  const confirmed = await showConfirmModal(`Сигурни ли сте, че искате да ${action} този потребител?`);
  if (!confirmed) return;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !isCurrentlyActive })
      .eq('id', id);

    if (error) throw error;

    loadUsers();
    await showMessageModal(
      isCurrentlyActive ? 'Потребителят е деактивиран успешно.' : 'Потребителят е активиран успешно.',
      'success'
    );
  } catch (err) {
    console.error('Error toggling user:', err);
    await showMessageModal('Грешка: ' + err.message, 'error');
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
