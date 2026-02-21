import { supabase } from '../../services/supabaseClient/supabaseClient.js';

export function createHomePage() {
  loadFeaturedProperties();
  setTimeout(initHeroSearch, 0);

  return `
    <section class="hero-section home-hero section-surface rounded-4 p-4 p-md-5 mb-4 text-center">
      <div class="col-lg-9">
        <h1 class="display-4 fw-bold mb-2 text-white">Открийте мечтания дом</h1>
        <p class="lead text-white text-opacity-75 mb-4">
          Най-добрата платформа за покупка, продажба и наем на жилищни имоти.
        </p>
        <form id="hero-search-form" class="home-hero-search bg-white rounded-4 shadow-lg p-3">
          <div class="row g-2 align-items-end">
            <div class="col-12 col-sm-6 col-md-3">
              <label class="form-label small fw-semibold text-secondary mb-1">Тип обява</label>
              <select class="form-select" id="hero-listing-type">
                <option value="all">Всички</option>
                <option value="sale">Продажба</option>
                <option value="rent">Наем</option>
              </select>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <label class="form-label small fw-semibold text-secondary mb-1">Вид имот</label>
              <select class="form-select" id="hero-prop-type">
                <option value="all">Всички видове</option>
                <option value="apartment">Апартамент</option>
                <option value="studio">Студио</option>
                <option value="house">Къща</option>
                <option value="villa">Вила</option>
                <option value="guest_house">Къща за гости</option>
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label small fw-semibold text-secondary mb-1">Местоположение</label>
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-geo-alt text-secondary"></i></span>
                <input type="text" class="form-control border-start-0" id="hero-location" placeholder="Град, село...">
              </div>
            </div>
            <div class="col-12 col-md-2">
              <button type="submit" class="btn btn-primary w-100 fw-bold">
                <i class="bi bi-search me-1"></i>Търси
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>

    <section aria-label="Препоръчани обяви" class="py-5">
      <div class="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2">
        <div>
          <h2 class="h3 fw-bold mb-1">Най-нови предложения</h2>
          <p class="text-secondary mb-0">Разгледайте последните добавени имоти</p>
        </div>
        <a href="#/listings" class="btn btn-link text-decoration-none fw-semibold">Виж всички <i class="bi bi-arrow-right"></i></a>
      </div>
      
      <div id="featured-properties-container" class="row g-4">
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Зареждане...</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function initHeroSearch() {
  const form = document.getElementById('hero-search-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const listingType = document.getElementById('hero-listing-type').value;
    const propType = document.getElementById('hero-prop-type').value;
    const location = document.getElementById('hero-location').value.trim();
    sessionStorage.setItem('pm_hero_search', JSON.stringify({ listingType, propType, location }));
    window.location.hash = '#/listings';
  });
}

async function loadFeaturedProperties() {
  await new Promise(resolve => setTimeout(resolve, 0));
  
  const container = document.getElementById('featured-properties-container');
  if (!container) return; // Component unmounted

  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          image_url,
          is_cover
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;

    if (!properties || properties.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-secondary">Все още няма добавени имоти.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = properties.map(property => createHomePropertyCard(property)).join('');

  } catch (err) {
    console.error('Error loading featured properties:', err);
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-warning d-inline-block">
          Неуспешно зареждане на препоръчаните имоти.
        </div>
      </div>
    `;
  }
}

function createHomePropertyCard(property) {
  let image = 'https://via.placeholder.com/400x300?text=No+Image';
  if (property.property_images?.length > 0) {
    const cover = property.property_images.find(img => img.is_cover) || property.property_images[0];
    image = cover.image_url;
  }

  const formatter = new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const price = formatter.format(property.price);
  const typeMap = { 'sale': 'Продажба', 'rent': 'Наем' };
  const badgeClass = property.listing_type === 'sale' ? 'bg-success' : 'bg-info';
  return `
    <div class="col-12 col-md-4">
      <div class="card h-100 border-0 shadow-sm hover-shadow transition-all rounded-4 overflow-hidden">
        <div class="position-relative overflow-hidden rounded-top">
          <img src="${image}" class="card-img-top" alt="${property.title}" style="height: 220px; object-fit: cover;">
          <span class="position-absolute top-0 start-0 m-3 badge ${badgeClass}">
            ${typeMap[property.listing_type] || property.listing_type}
          </span>
          ${property.is_active === false ? `
          <span class="position-absolute top-0 end-0 m-3 badge text-bg-warning">
            <i class="bi bi-eye-slash me-1"></i>Деактивирана
          </span>` : ''}
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title h6 mb-0 text-truncate fw-bold" title="${property.title}">
              <a href="#/property/${property.id}" class="text-dark text-decoration-none stretched-link">
                ${property.title}
              </a>
            </h5>
          </div>
          <p class="text-primary fw-bold mb-2">${price}</p>
          <p class="card-text text-secondary small mb-0">
            <i class="bi bi-geo-alt-fill me-1"></i>${property.city}
          </p>
        </div>
      </div>
    </div>
  `;
}

