import { supabase } from '../../services/supabaseClient/supabaseClient.js';
import { showPageFeedback } from '../../utils/ui.js';

export function createMyListingsPage() {
  setTimeout(initMyListingsPage, 0);

  return `
    <div class="container py-4" id="my-listings-page-container">
      <section class="rounded-4 p-4 p-md-5 bg-white border shadow-sm">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 fw-bold mb-0">Моите Обяви</h1>
          <a href="#/create-property" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-lg me-1"></i>Добави нова
          </a>
        </div>
        <div id="my-properties-list" class="row g-4">
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
  
  const price = new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price);
  const typeMap = { 'sale': 'Продажба', 'rent': 'Наем' };
  const propertyTypeMap = { 
    'apartment': 'Апартамент', 
    'house': 'Къща', 
    'villa': 'Вила', 
    'guest_house': 'Къща за гости' 
  };

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm border-0 transition-hover">
        <div class="position-relative">
            <img src="${coverUrl}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="${property.title}">
            <span class="position-absolute top-0 end-0 m-2 badge bg-white text-dark shadow-sm opacity-75">
                ${typeMap[property.listing_type]}
            </span>
        </div>
        <div class="card-body d-flex flex-column">
           <h5 class="card-title text-truncate" title="${property.title}">
             <a href="#/property/${property.id}" class="text-decoration-none text-dark stretched-link">${property.title}</a>
           </h5>
           <p class="card-text text-secondary small mb-2">
             <i class="bi bi-geo-alt me-1"></i>${property.city}
           </p>
           <div class="mt-auto d-flex justify-content-between align-items-center">
             <span class="text-primary fw-bold fs-5">${price}</span>
             <!-- Z-index relative required to click button above stretched link -->
             <a href="#/edit-property/${property.id}" class="btn btn-outline-warning btn-sm position-relative z-2" title="Редактирай">
               <i class="bi bi-pencil me-1"></i> Редактирай
             </a>
           </div>
        </div>
        <div class="card-footer bg-white border-top-0 text-muted small">
            ${propertyTypeMap[property.property_type]} • ${property.area_sq_m} кв.м.
        </div>
      </div>
    </div>
  `;
}
