import { supabase } from '../../services/supabaseClient/supabaseClient.js';

export function createAdminPage() {
  setTimeout(initAdminPage, 0);

  return `
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
      <tr>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.full_name || '-')}</td>
        <td>
          <span class="badge ${user.role === 'admin' ? 'text-bg-danger' : 'text-bg-secondary'}">
            ${user.role === 'admin' ? 'Admin' : 'User'}
          </span>
        </td>
        <td>${new Date(user.created_at).toLocaleDateString()}</td>
        <td>
          ${user.role !== 'admin' ? `
            <button class="btn btn-sm btn-outline-danger delete-user-btn" data-id="${user.id}">
              Изтрий
            </button>
          ` : '<span class="text-muted small">Не може да се изтрие</span>'}
        </td>
      </tr>
    `).join('');

    // Attach event listeners
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', (e) => handleDeleteUser(e.target.dataset.id));
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
        <td class="fw-bold text-primary">${prop.price.toLocaleString()} лв.</td>
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
  if (!confirm('Сигурни ли сте, че искате да изтриете тази обява?')) return;

  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;

    loadProperties(); // Reload list
    alert('Обявата беше изтрита успешно.');
  } catch (err) {
    console.error('Error deleting property:', err);
    alert('Грешка при изтриване: ' + err.message);
  }
}

async function handleDeleteUser(id) {
  if (!confirm('ВНИМАНИЕ: Изтриването на потребител ще изтрие и всички негови обяви! Сигурни ли сте?')) return;
  
  // Note: Client-side deletion of auth users is restricted. 
  // We can only delete from public.profiles if our RLS allows it (which it does for admin).
  // However, since profiles.id references auth.users.id, we cannot delete profile without deleting auth user 
  // unless we remove the foreign key constraint or fetch delete from server side.
  // BUT, usually for these projects, we just delete the PROFILE data or use a server function.
  // Since we don't have a backend function for auth deletion exposed, we will try to delete the profile row.
  // If the DB is set up with 'ON DELETE CASCADE' from auth to profile, deleting profile won't delete auth user.
  
  // Actually, usually in Supabase, you delete the user from the Management Dashboard.
  // But let's try to delete the profile row as per the requirements "manage users".
  
  try {
     // NOTE: This will likely FAIL if we try to delete a user that is linked to auth.users 1:1 
     // and we don't have Cascade set up backwards (Profile -> User is not possible).
     // BUT, we defined Admin RLS to delete profiles. 
     
     // Let's try deleting listing ownership first or just delete profile.
     const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
       if (error.code === '23503') { // FK violation
           throw new Error('Не може да изтриете профила, защото е свързан с Auth потребител. Използвайте Supabase Dashboard за пълно изтриване.');
       }
       throw error;
    }

    loadUsers();
    alert('Профилът беше изтрит (Забележка: Auth акаунтът може да е все още активен).');
  } catch (err) {
    console.error('Error deleting user:', err);
    alert('Грешка: ' + err.message);
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
