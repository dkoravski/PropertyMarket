import { supabase } from '../../services/supabaseClient/supabaseClient.js';

export function createListingsPage(category = 'Всички обяви') {
  loadListings(category);

  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 class="h3 fw-bold mb-1">Обяви за имоти</h1>
          <p class="mb-0 text-secondary">Категория: <strong>${category}</strong></p>
        </div>
      </div>
      
      <div id="listings-wrapper" class="row g-4 mt-2">
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Зареждане...</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

async function loadListings(category) {
  // Wait for the render to complete
  await new Promise(resolve => setTimeout(resolve, 0));

  const wrapper = document.getElementById('listings-wrapper');
  if (!wrapper) return;

  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images (
          image_url,
          is_cover
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filtering based on category
    if (category === 'Продажби') {
      query = query.eq('listing_type', 'sale');
    } else if (category === 'Наеми') {
      query = query.eq('listing_type', 'rent');
    }

    const { data: properties, error } = await query;

    if (error) throw error;

    if (!properties || properties.length === 0) {
      wrapper.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-secondary mb-0">Няма намерени обяви в тази категория.</p>
        </div>
      `;
      return;
    }

    wrapper.innerHTML = properties.map(property => createListingCard(property)).join('');
    
  } catch (err) {
    console.error('Error loading listings:', err);
    wrapper.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-danger d-inline-block">
          Възникна грешка при зареждането на обявите. Моля, опитайте отново по-късно.
        </div>
      </div>
    `;
  }
}

function createListingCard(property) {
  // Determine the cover image
  let coverImage = 'https://via.placeholder.com/400x300?text=No+Image';
  
  if (property.property_images && property.property_images.length > 0) {
    // Try to find the image marked as cover
    const cover = property.property_images.find(img => img.is_cover);
    if (cover) {
      coverImage = cover.image_url;
    } else {
      // Fallback to the first image if no cover is set
      coverImage = property.property_images[0].image_url;
    }
  }

  // Format price
  const priceFormatted = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(property.price);

  // Translate types
  const typeMap = {
    'apartment': 'Апартамент',
    'house': 'Къща',
    'villa': 'Вила',
    'guest_house': 'Къща за гости'
  };
  
  const listingTypeMap = {
    'sale': 'Продажба',
    'rent': 'Наем'
  };

  const propertyType = typeMap[property.property_type] || property.property_type;
  const listingType = listingTypeMap[property.listing_type] || property.listing_type;
  
  const badgeClass = property.listing_type === 'sale' ? 'bg-success' : 'bg-info';

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm border-0 listing-card">
        <div class="position-relative">
          <img src="${coverImage}" class="card-img-top" alt="${property.title}" style="height: 240px; object-fit: cover;">
          <span class="position-absolute top-0 end-0 m-3 badge ${badgeClass} fs-6 shadow-sm">
            ${listingType}
          </span>
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <small class="text-secondary"><i class="bi bi-geo-alt-fill me-1"></i>${property.city}</small>
            <small class="text-secondary">${propertyType}</small>
          </div>
          <h5 class="card-title text-truncate" title="${property.title}">${property.title}</h5>
          <h6 class="card-subtitle mb-3 text-primary fw-bold fs-4">${priceFormatted}</h6>
          
          <div class="d-flex justify-content-between border-top pt-3 mt-3">
            <span class="text-secondary" title="Площ">
              <i class="bi bi-arrows-fullscreen me-1"></i>${property.area_sq_m} м²
            </span>
            <span class="text-secondary" title="Стаи">
              <i class="bi bi-door-closed me-1"></i>${property.rooms} стаи
            </span>
          </div>
        </div>
        <div class="card-footer bg-white border-top-0 pt-0 pb-3">
          <a href="#/property/${property.id}" class="btn btn-outline-primary w-100 stretched-link">
            Детайли
          </a>
        </div>
      </div>
    </div>
  `;
}

