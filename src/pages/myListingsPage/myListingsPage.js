import { supabase } from '../../services/supabaseClient/supabaseClient.js';
import { showPageFeedback, showConfirmModal, showMessageModal } from '../../utils/ui.js';

export function createMyListingsPage() {
  setTimeout(initMyListingsPage, 0);

  return `
    <div class="container py-4" id="my-listings-page-container">
      <div class="mb-3">
        <button onclick="history.back()" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>Назад
        </button>
      </div>
      <section class="my-listings-surface rounded-4 p-4 p-md-5 bg-white border shadow-sm">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 fw-bold mb-0">Моите Обяви</h1>
        </div>
        <div id="my-properties-list" class="my-listings-grid row g-4">
           <!-- Properties will be loaded here -->
           <div class="col-12 text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
           </div>
        </div>
      </section>
    </div>
  `;
}

async function initMyListingsPage() {
  const container = document.getElementById('my-listings-page-container');
  if (!container) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.hash = '#/login';
      return;
    }

    loadUserProperties(user.id, container);

  } catch (err) {
    console.error('Auth error:', err);
    container.innerHTML = `<div class="alert alert-danger">Грешка при проверка на потребител.</div>`;
  }
}

async function loadUserProperties(userId, container) {
  const list = container.querySelector('#my-properties-list');
  
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (image_url, is_cover)
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!properties || properties.length === 0) {
      list.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-houses fs-1 text-secondary mb-3 d-block"></i>
          <p class="text-secondary mb-3 fs-5">Все още нямате публикувани обяви.</p>
          <a href="#/create-property" class="btn btn-outline-primary">Добави първата си обява</a>
        </div>
      `;
      return;
    }

    list.innerHTML = properties.map(p => createMyPropertyCard(p)).join('');

    // Attach toggle listeners
    list.querySelectorAll('.toggle-my-prop-btn').forEach(btn => {
      btn.addEventListener('click', () => handleToggleMyProperty(btn.dataset.id, btn.dataset.active === 'true', btn.dataset.userId));
    });

  } catch (err) {
    console.error('My properties error:', err);
    showPageFeedback('danger', 'Неуспешно зареждане на обявите: ' + err.message);
    list.innerHTML = `<div class="alert alert-danger col-12">Неуспешно зареждане на обявите.</div>`;
  }
}

function createMyPropertyCard(property) {
  const images = property.property_images || [];
  const cover = images.find(i => i.is_cover) || images[0];
  const coverUrl = cover ? cover.image_url : 'https://via.placeholder.com/300x200?text=No+Image';
  
  let price = new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price);
  if (property.listing_type === 'rent') {
    price += ' / месец';
  }
  const typeMap = { 'sale': 'Продажба', 'rent': 'Наем' };
  const propertyTypeMap = { 
    'apartment': 'Апартамент', 
    'studio': 'Студио',
    'house': 'Къща', 
    'villa': 'Вила', 
    'guest_house': 'Къща за гости' 
  };

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm border-0 transition-hover rounded-4 overflow-hidden ${property.is_active === false ? 'opacity-75' : ''}">
        <div class="position-relative">
            <img src="${coverUrl}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="${property.title}">
            <span class="position-absolute top-0 end-0 m-2 badge bg-white text-dark shadow-sm opacity-75">
                ${typeMap[property.listing_type]}
            </span>
            <span class="position-absolute top-0 start-0 m-2 badge ${property.is_active === false ? 'text-bg-warning' : 'text-bg-success'}">
              ${property.is_active === false ? '<i class="bi bi-eye-slash me-1"></i>Деактивирана' : '<i class="bi bi-eye me-1"></i>Активна'}
            </span>
        </div>
        <div class="card-body d-flex flex-column">
           <h5 class="card-title text-truncate" title="${property.title}">
             <a href="#/property/${property.id}" class="text-decoration-none text-dark stretched-link">${property.title}</a>
           </h5>
           <p class="card-text text-secondary small mb-2">
             <i class="bi bi-geo-alt me-1"></i>${property.city}
           </p>
           <div class="mt-auto d-flex justify-content-between align-items-center gap-1">
             <span class="text-primary fw-bold fs-5">${price}</span>
             <div class="d-flex gap-1 position-relative z-2">
               <button class="btn btn-sm ${property.is_active === false ? 'btn-outline-success' : 'btn-outline-secondary'} toggle-my-prop-btn"
                 data-id="${property.id}" data-active="${property.is_active !== false}" data-user-id="${property.owner_id}"
                 title="${property.is_active === false ? 'Активирай' : 'Деактивирай'}">
                 <i class="bi bi-${property.is_active === false ? 'eye' : 'eye-slash'}"></i>
               </button>
               <a href="#/edit-property/${property.id}" class="btn btn-outline-warning btn-sm" title="Редактирай">
                 <i class="bi bi-pencil"></i>
               </a>
             </div>
           </div>
        </div>
        <div class="card-footer bg-white border-top-0 text-muted small">
            ${propertyTypeMap[property.property_type]} • ${property.area_sq_m} кв.м.
        </div>
      </div>
    </div>
  `;
}

async function handleToggleMyProperty(id, isCurrentlyActive, userId) {
  const action = isCurrentlyActive ? 'деактивирате' : 'активирате';
  const confirmed = await showConfirmModal(
    isCurrentlyActive
      ? 'Сигурни ли сте? Обявата ще стане невидима за останалите потребители.'
      : 'Сигурни ли сте? Обявата ще стане видима за всички.'
  );
  if (!confirmed) return;

  try {
    const { error } = await supabase
      .from('properties')
      .update({ is_active: !isCurrentlyActive })
      .eq('id', id);

    if (error) throw error;

    // Reload listings
    const container = document.getElementById('my-listings-page-container');
    if (container) loadUserProperties(userId, container);
    await showMessageModal(
      isCurrentlyActive ? 'Обявата е деактивирана.' : 'Обявата е активирана.',
      'success'
    );
  } catch (err) {
    console.error('Toggle property error:', err);
    await showMessageModal('Грешка: ' + err.message, 'error');
  }
}
