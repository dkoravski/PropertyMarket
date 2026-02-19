import { supabase } from '../../services/supabaseClient/supabaseClient.js';

export function createFavoritesPage() {
  const container = document.createElement('div');
  container.className = 'container py-4';
  container.id = 'favorites-container';

  container.innerHTML = `
    <section class="rounded-4 p-4 p-md-5 bg-light border mb-4">
      <h1 class="h3 fw-bold mb-3">Любими имоти</h1>
      <p class="mb-4 text-secondary">Списък с вашите запазени обяви.</p>
      
      <div id="favorites-list" class="row g-4">
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Зареждане...</span>
          </div>
        </div>
      </div>
    </section>
  `;

  loadFavorites(container);

  return container;
}

async function loadFavorites(container) {
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
  if (!confirm('Сигурни ли сте, че искате да премахнете този имот от любими?')) return;

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favId);

    if (error) throw error;
    
    // Reload list
    loadFavorites(container);

  } catch (err) {
    alert('Грешка при премахване: ' + err.message);
  }
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
  const price = new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price);
  const typeMap = { 'apartment': 'Апартамент', 'house': 'Къща', 'villa': 'Вила', 'guest_house': 'Къща за гости' };
  const listingMap = { 'sale': 'Продажба', 'rent': 'Наем' };

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm border-0">
        <div class="position-relative overflow-hidden rounded-top">
          <img src="${coverUrl}" class="card-img-top object-fit-cover" style="height: 200px;" alt="${property.title}">
          <span class="position-absolute top-0 start-0 m-3 badge ${property.listing_type === 'sale' ? 'bg-success' : 'bg-info'}">
            ${listingMap[property.listing_type]}
          </span>
          <button class="btn btn-light btn-sm position-absolute top-0 end-0 m-3 rounded-circle shadow-sm btn-remove-fav" 
                  data-fav-id="${fav.id}" title="Премахни от любими">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="card-body">
          <h5 class="card-title text-truncate mb-1" title="${property.title}">${property.title}</h5>
          <p class="text-primary fw-bold mb-2 fs-5">${price}</p>
          <div class="text-secondary small mb-3">
             <i class="bi bi-geo-alt-fill me-1"></i>${property.city} • ${typeMap[property.property_type]}
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

