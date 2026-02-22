import { supabase } from '../../services/supabaseClient/supabaseClient.js';

export function createFavoritesPage() {
  setTimeout(() => loadFavorites(), 0);

  return `
    <div id="favorites-container" class="container py-4">
      <div class="mb-3">
        <button onclick="history.back()" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left me-1"></i>Назад
        </button>
      </div>
      <section class="favorites-surface rounded-4 p-4 p-md-5 bg-white border mb-4">
      <h1 class="h3 fw-bold mb-3">Любими имоти</h1>
      <p class="mb-4 text-secondary">Списък с вашите запазени обяви.</p>
      
      <div id="favorites-list" class="favorites-grid row g-4">
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Зареждане...</span>
          </div>
        </div>
      </div>
    </section>
    </div>
  `;
}

async function loadFavorites() {
  const container = document.getElementById('favorites-container');
  if (!container) return;

  const listContainer = container.querySelector('#favorites-list');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      listContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning">
            Моля, влезте в профила си, за да видите любимите си имоти.
          </div>
        </div>
      `;
      return;
    }

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        properties (
          *,
          property_images (
            image_url,
            is_cover
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!favorites || favorites.length === 0) {
      listContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-secondary mb-3">Нямате добавени имоти в любими.</p>
          <a href="#/listings" class="btn btn-primary">Разгледай обявите</a>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = favorites.map(fav => createFavoriteCard(fav)).join('');
    
    // Attach remove handlers
    listContainer.querySelectorAll('.btn-remove-fav').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const favId = btn.dataset.favId;
        await removeFavorite(favId, container);
      });
    });

  } catch (err) {
    console.error('Error loading favorites:', err);
    listContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          Възникна грешка при зареждането на любими имоти.
        </div>
      </div>
    `;
  }
}

async function removeFavorite(favId, container) {
  const isConfirmed = await showConfirmModal('Сигурни ли сте, че искате да премахнете този имот от любими?');
  if (!isConfirmed) return;

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favId);

    if (error) throw error;
    showPageFeedback(container, 'Имотът е премахнат от любими.', 'success');
    
    // Reload list
    loadFavorites(container);

  } catch (err) {
    showPageFeedback(container, 'Грешка при премахване: ' + err.message, 'danger');
  }
}

function showPageFeedback(container, message, type = 'success') {
  const oldAlert = container.querySelector('#favorites-feedback');
  if (oldAlert) oldAlert.remove();

  const section = container.querySelector('section');
  if (!section) return;

  section.insertAdjacentHTML('afterbegin', `
    <div id="favorites-feedback" class="alert alert-${type} alert-dismissible fade show mb-4" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Затвори"></button>
    </div>
  `);
}

function showConfirmModal(message) {
  return new Promise((resolve) => {
    const modalId = `confirm-modal-${Date.now()}`;
    const modalMarkup = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header">
              <h5 class="modal-title">Потвърждение</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отказ</button>
              <button type="button" class="btn btn-danger" id="${modalId}-confirm">Премахни</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalMarkup);
    const modalEl = document.getElementById(modalId);
    const confirmBtn = document.getElementById(`${modalId}-confirm`);
    const modalInstance = new bootstrap.Modal(modalEl);

    let resolved = false;

    confirmBtn.addEventListener('click', () => {
      resolved = true;
      resolve(true);
      modalInstance.hide();
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
      if (!resolved) resolve(false);
      modalEl.remove();
    }, { once: true });

    modalInstance.show();
  });
}

function createFavoriteCard(fav) {
  const property = fav.properties;
  // If property was deleted but favorite record remains (should cascade delete in DB, but just in case)
  if (!property) return ''; 

  // Image handling
  const images = property.property_images || [];
  images.sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0));
  const coverUrl = images.length > 0 ? images[0].image_url : 'https://via.placeholder.com/400x300?text=No+Image';

  // Formatting
  let price = new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price);
  if (property.listing_type === 'rent') {
    price += ' / месец';
  }
  const typeMap = { 'apartment': 'Апартамент', 'studio': 'Студио', 'house': 'Къща', 'villa': 'Вила', 'guest_house': 'Къща за гости' };
  const listingMap = { 'sale': 'Продажба', 'rent': 'Наем' };
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm border-0 transition-hover">
        <div class="position-relative overflow-hidden rounded-top fav-image-wrap">
          <img src="${coverUrl}" class="card-img-top object-fit-cover" style="height: 200px;" alt="${property.title}">
          <span class="position-absolute top-0 start-0 m-3 text-white fw-semibold" style="text-shadow: 0 1px 3px rgba(0,0,0,0.75); pointer-events: none;">
            ${listingMap[property.listing_type]}
          </span>
          ${property.is_active === false ? `
          <span class="position-absolute bottom-0 start-0 m-3 badge text-bg-warning">
            <i class="bi bi-eye-slash-fill me-1 pm-photo-icon"></i>Деактивирана
          </span>` : ''}
          <button class="btn btn-link p-0 position-absolute top-0 end-0 m-3 text-danger text-decoration-none fw-semibold btn-remove-fav btn-remove-fav-fx"
                  data-fav-id="${fav.id}" title="Премахни от любими" aria-label="Премахни от любими">
            <i class="bi bi-heartbreak-fill pm-photo-icon"></i>
            <span>Премахни</span>
          </button>
        </div>
        <div class="card-body">
          <h5 class="card-title text-truncate mb-1" title="${property.title}">${property.title}</h5>
          <p class="text-primary fw-bold mb-2 fs-5">${price}</p>
          <div class="text-secondary small mb-3">
             <i class="bi bi-geo-alt-fill me-1 pm-accent-icon"></i>${property.city} • ${typeMap[property.property_type]}
          </div>
          <div class="d-flex justify-content-between text-secondary border-top pt-3 small">
             <span><i class="bi bi-arrows-fullscreen me-1"></i>${property.area_sq_m} м²</span>
             <span><i class="bi bi-door-closed me-1"></i>${property.rooms} стаи</span>
          </div>
        </div>
        <div class="card-footer bg-white border-top-0 pt-0 pb-3">
          <a href="#/property/${property.id}" class="btn btn-outline-primary w-100">Виж детайли</a>
        </div>
      </div>
    </div>
  `;
}

