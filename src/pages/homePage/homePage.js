import { supabase } from '../../services/supabaseClient/supabaseClient.js';

export function createHomePage() {
  loadFeaturedProperties();

  return `
    <section class="hero-section rounded-4 p-4 p-md-5 mb-4 bg-light border text-center text-lg-start d-flex align-items-center" 
             style="background-image: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1973&q=80'); background-size: cover; background-position: center; min-height: 400px;">
      <div class="col-lg-8">
        <h1 class="display-4 fw-bold mb-3 text-primary">Открийте мечтания дом</h1>
        <p class="lead text-secondary mb-4 fs-4">
          Най-добрата платформа за покупка, продажба и наем на недвижими имоти.
          Вашите мечти, нашият ангажимент.
        </p>
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center justify-content-lg-start">
          <a href="#/listings-sales" class="btn btn-primary btn-lg px-4 gap-3">Купи имот</a>
          <a href="#/listings-rent" class="btn btn-outline-dark btn-lg px-4">Наеми имот</a>
        </div>
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
      <div class="card h-100 border-0 shadow-sm hover-shadow transition-all">
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

