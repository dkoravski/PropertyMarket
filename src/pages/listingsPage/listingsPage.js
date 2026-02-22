import { supabase } from '../../services/supabaseClient/supabaseClient.js';

const PAGE_SIZE = 9;
let currentPage = 1;
let currentSort = 'newest';
const ALLOWED_SORTS = new Set(['newest', 'oldest', 'price_asc', 'price_desc']);
let restoredFilterState = null;

export function createListingsPage(category = 'Всички обяви') {
  // Determine initial filter state based on category
  let initialListingType = 'all';
  if (category === 'Продажби') initialListingType = 'sale';
  if (category === 'Наеми') initialListingType = 'rent';

  currentPage = 1;
  currentSort = 'newest';
  restoredFilterState = restoreListingsStateFromUrl();

  // We defer the loading so the DOM is ready
  setTimeout(() => {
    // Apply pre-fill from hero search if present
    const heroSearch = sessionStorage.getItem('pm_hero_search');
    if (heroSearch) {
      try {
        const { listingType: ht, propType: hp, location: hl } = JSON.parse(heroSearch);
        sessionStorage.removeItem('pm_hero_search');
        if (ht && ht !== 'all') {
          const radio = document.querySelector(`input[name="listingType"][value="${ht}"]`);
          if (radio) radio.checked = true;
        }
        if (hp && hp !== 'all') {
          const sel = document.getElementById('filter-prop-type');
          if (sel) sel.value = hp;
        }
        if (hl) {
          const loc = document.getElementById('filter-location');
          if (loc) loc.value = hl;
        }
      } catch (_) {}
    } else if (restoredFilterState) {
      applyFilterStateToForm(restoredFilterState);
    } else if (initialListingType !== 'all') {
      const radio = document.querySelector(`input[name="listingType"][value="${initialListingType}"]`);
      if (radio) radio.checked = true;
    }
    
    // Initial load
    const initialSortSelect = document.getElementById('sort-select');
    if (initialSortSelect) {
      initialSortSelect.value = currentSort;
    }

    filterListings();

    // Attach event listeners
    document.getElementById('search-form').addEventListener('submit', (e) => {
      e.preventDefault();
      currentPage = 1;
      filterListings();
    });

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        currentPage = 1;
        filterListings();
      });
    }

    const paginationWrapper = document.getElementById('pagination-wrapper');
    if (paginationWrapper) {
      paginationWrapper.addEventListener('click', (e) => {
        const target = e.target.closest('button[data-page]');
        if (!target) return;

        const requestedPage = Number(target.dataset.page);
        if (!Number.isFinite(requestedPage) || requestedPage < 1 || requestedPage === currentPage) return;

        currentPage = requestedPage;
        filterListings();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    document.getElementById('clear-filters').addEventListener('click', () => {
      document.getElementById('search-form').reset();
      // Reset radio to 'all' or keep category? Let's reset to 'all' for true clear
      document.querySelector('input[name="listingType"][value="all"]').checked = true;
      currentPage = 1;
      currentSort = 'newest';
      const s = document.getElementById('sort-select');
      if (s) s.value = 'newest';
      filterListings();
    });
  }, 0);

  return `
    <section class="container py-4">
      <div class="row g-4">
        <!-- Sidebar Filters (Desktop) / Collapse (Mobile) -->
        <div class="col-lg-3">
          <div class="card listings-filter-card border-0 shadow-sm rounded-4 sticky-lg-top" style="top: 20px; z-index: 100;">
            <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-sliders me-2"></i>Филтри</h5>
            </div>
            <div class="card-body">
              <form id="search-form">
                
                <!-- Listing Type -->
                <div class="mb-3">
                  <label class="form-label fw-semibold small text-uppercase text-secondary"><i class="bi bi-megaphone-fill me-1 pm-accent-icon"></i>Тип обява</label>
                  <div class="d-flex flex-column gap-2">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="listingType" id="type-all" value="all" checked>
                      <label class="form-check-label" for="type-all">Всички</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="listingType" id="type-sale" value="sale">
                      <label class="form-check-label" for="type-sale">Продажба</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="listingType" id="type-rent" value="rent">
                      <label class="form-check-label" for="type-rent">Наем</label>
                    </div>
                  </div>
                </div>

                <!-- Property Type -->
                <div class="mb-3">
                  <label for="filter-prop-type" class="form-label fw-semibold small text-uppercase text-secondary"><i class="bi bi-house-door-fill me-1 pm-accent-icon"></i>Вид имот</label>
                  <select class="form-select" id="filter-prop-type">
                    <option value="all">Всички видове</option>
                    <option value="apartment">Апартаменти</option>
                    <option value="studio">Студиа</option>
                    <option value="house">Къщи</option>
                    <option value="villa">Вили</option>
                    <option value="guest_house">Къщи за гости</option>
                  </select>
                </div>

                <!-- Price Range -->
                <div class="mb-3">
                  <label class="form-label fw-semibold small text-uppercase text-secondary">Цена (€)</label>
                  <div class="d-flex gap-2">
                    <input type="number" class="form-control" id="filter-price-min" placeholder="От" min="0">
                    <input type="number" class="form-control" id="filter-price-max" placeholder="До" min="0">
                  </div>
                </div>

                <!-- Area Range -->
                <div class="mb-3">
                  <label class="form-label fw-semibold small text-uppercase text-secondary">Площ (кв.м)</label>
                  <div class="d-flex gap-2">
                    <input type="number" class="form-control" id="filter-area-min" placeholder="От" min="0">
                    <input type="number" class="form-control" id="filter-area-max" placeholder="До" min="0">
                  </div>
                </div>

                <!-- Rooms -->
                <div class="mb-3">
                  <label for="filter-rooms" class="form-label fw-semibold small text-uppercase text-secondary">Минимум стаи</label>
                  <input type="number" class="form-control" id="filter-rooms" placeholder="Брой стаи" min="1">
                </div>

                <!-- Location -->
                <div class="mb-4">
                  <label for="filter-location" class="form-label fw-semibold small text-uppercase text-secondary"><i class="bi bi-geo-alt-fill me-1 pm-accent-icon"></i>Населено място</label>
                  <input type="text" class="form-control" id="filter-location" placeholder="Град, село...">
                </div>

                <!-- Buttons -->
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary fw-bold">Търси</button>
                  <button type="button" id="clear-filters" class="btn btn-outline-secondary btn-sm">Изчисти филтрите</button>
                </div>

              </form>
            </div>
          </div>
        </div>

        <!-- Listings Column -->
        <div class="col-lg-9">
           <div class="listings-results-bar d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border gap-3 flex-wrap">
              <h1 class="h4 fw-bold mb-0 text-primary">Резултати</h1>
              <div class="d-flex align-items-center gap-2 ms-auto">
                <label for="sort-select" class="small text-secondary mb-0">Сортиране:</label>
                <select id="sort-select" class="form-select form-select-sm" style="min-width: 190px;">
                  <option value="newest" selected>Най-нови</option>
                  <option value="oldest">Най-стари</option>
                  <option value="price_asc">Цена: ниска към висока</option>
                  <option value="price_desc">Цена: висока към ниска</option>
                </select>
                <span class="badge bg-secondary rounded-pill" id="results-count">0 намерени</span>
              </div>
           </div>

           <div id="listings-wrapper" class="listings-grid row g-4">
             <div class="col-12 text-center py-5">
               <div class="spinner-border text-primary" role="status">
                 <span class="visually-hidden">Зареждане...</span>
               </div>
             </div>
           </div>

           <div id="pagination-wrapper" class="pagination-wrap mt-4"></div>
        </div>
      </div>
    </section>
  `;
}

function getSortConfig(sortKey) {
  switch (sortKey) {
    case 'oldest':
      return { column: 'created_at', ascending: true };
    case 'price_asc':
      return { column: 'price', ascending: true };
    case 'price_desc':
      return { column: 'price', ascending: false };
    case 'newest':
    default:
      return { column: 'created_at', ascending: false };
  }
}

function restoreListingsStateFromUrl() {
  const hash = window.location.hash || '#/listings';
  const queryIndex = hash.indexOf('?');
  if (queryIndex === -1) return null;

  const query = hash.slice(queryIndex + 1);
  const params = new URLSearchParams(query);

  const pageParam = Number(params.get('page'));
  if (Number.isFinite(pageParam) && pageParam > 0) {
    currentPage = Math.floor(pageParam);
  }

  const sortParam = params.get('sort');
  if (sortParam && ALLOWED_SORTS.has(sortParam)) {
    currentSort = sortParam;
  }

  return {
    listingType: params.get('listingType') || 'all',
    propertyType: params.get('propertyType') || 'all',
    priceMin: params.get('priceMin') || '',
    priceMax: params.get('priceMax') || '',
    areaMin: params.get('areaMin') || '',
    areaMax: params.get('areaMax') || '',
    rooms: params.get('rooms') || '',
    location: params.get('location') || '',
  };
}

function applyFilterStateToForm(filterState) {
  if (!filterState) return;

  const listingType = ['all', 'sale', 'rent'].includes(filterState.listingType)
    ? filterState.listingType
    : 'all';

  const listingRadio = document.querySelector(`input[name="listingType"][value="${listingType}"]`);
  if (listingRadio) listingRadio.checked = true;

  const propertyTypeSelect = document.getElementById('filter-prop-type');
  if (propertyTypeSelect) {
    const allowedPropertyTypes = ['all', 'apartment', 'studio', 'house', 'villa', 'guest_house'];
    propertyTypeSelect.value = allowedPropertyTypes.includes(filterState.propertyType)
      ? filterState.propertyType
      : 'all';
  }

  const priceMinInput = document.getElementById('filter-price-min');
  const priceMaxInput = document.getElementById('filter-price-max');
  const areaMinInput = document.getElementById('filter-area-min');
  const areaMaxInput = document.getElementById('filter-area-max');
  const roomsInput = document.getElementById('filter-rooms');
  const locationInput = document.getElementById('filter-location');

  if (priceMinInput) priceMinInput.value = filterState.priceMin;
  if (priceMaxInput) priceMaxInput.value = filterState.priceMax;
  if (areaMinInput) areaMinInput.value = filterState.areaMin;
  if (areaMaxInput) areaMaxInput.value = filterState.areaMax;
  if (roomsInput) roomsInput.value = filterState.rooms;
  if (locationInput) locationInput.value = filterState.location;
}

function syncListingsStateToUrl(filters) {
  const hash = window.location.hash || '#/listings';
  const queryIndex = hash.indexOf('?');
  const baseHash = queryIndex === -1 ? hash : hash.slice(0, queryIndex);

  const params = new URLSearchParams();
  params.set('page', String(currentPage));
  params.set('sort', currentSort);

  if (filters.listingType && filters.listingType !== 'all') params.set('listingType', filters.listingType);
  if (filters.propertyType && filters.propertyType !== 'all') params.set('propertyType', filters.propertyType);
  if (filters.priceMin) params.set('priceMin', filters.priceMin);
  if (filters.priceMax) params.set('priceMax', filters.priceMax);
  if (filters.areaMin) params.set('areaMin', filters.areaMin);
  if (filters.areaMax) params.set('areaMax', filters.areaMax);
  if (filters.rooms) params.set('rooms', filters.rooms);
  if (filters.location) params.set('location', filters.location);

  const newHash = `${baseHash}?${params.toString()}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const nextUrl = `${window.location.pathname}${window.location.search}${newHash}`;

  if (currentUrl !== nextUrl) {
    window.history.replaceState({}, '', nextUrl);
  }
}

async function filterListings() {
  const wrapper = document.getElementById('listings-wrapper');
  const countBadge = document.getElementById('results-count');
  const paginationWrapper = document.getElementById('pagination-wrapper');
  
  if (!wrapper) return;

  // Gather filter values
  const listingType = document.querySelector('input[name="listingType"]:checked').value;
  const propertyType = document.getElementById('filter-prop-type').value;
  const priceMin = document.getElementById('filter-price-min').value;
  const priceMax = document.getElementById('filter-price-max').value;
  const areaMin = document.getElementById('filter-area-min').value;
  const areaMax = document.getElementById('filter-area-max').value;
  const rooms = document.getElementById('filter-rooms').value;
  const location = document.getElementById('filter-location').value.trim();
  const sortSelect = document.getElementById('sort-select');

  if (sortSelect) {
    currentSort = sortSelect.value;
  }

  const { column: sortColumn, ascending: sortAscending } = getSortConfig(currentSort);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  syncListingsStateToUrl({
    listingType,
    propertyType,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    rooms,
    location,
  });

  wrapper.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  `;
  if (paginationWrapper) paginationWrapper.innerHTML = '';

  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images (
          image_url,
          is_cover
        )
      `, { count: 'exact' })
      .order(sortColumn, { ascending: sortAscending })
      .range(from, to);

    // Apply Filters
    if (listingType !== 'all') {
      query = query.eq('listing_type', listingType);
    }

    if (propertyType !== 'all') {
      query = query.eq('property_type', propertyType);
    }

    if (priceMin) query = query.gte('price', priceMin);
    if (priceMax) query = query.lte('price', priceMax);

    if (areaMin) query = query.gte('area_sq_m', areaMin);
    if (areaMax) query = query.lte('area_sq_m', areaMax);

    if (rooms) query = query.gte('rooms', rooms);

    if (location) {
      // Create a case-insensitive logical OR search for city OR address
      // Syntax: column.ilike.pattern, column.ilike.pattern
      // Or filter syntax: or=(city.ilike.%val%,address.ilike.%val%)
      query = query.or(`city.ilike.%${location}%,address.ilike.%${location}%`);
    }

    const { data: properties, error, count } = await query;

    if (error) throw error;

    countBadge.textContent = `${count || 0} намерени`;

    if ((!properties || properties.length === 0) && (count || 0) > 0 && currentPage > 1) {
      currentPage = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));
      syncListingsStateToUrl();
      filterListings();
      return;
    }

    if (!properties || properties.length === 0) {
      wrapper.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="mb-3"><i class="bi bi-search fs-1 text-muted"></i></div>
          <p class="text-secondary fs-5">Няма намерени обяви по тези критерии.</p>
          <button class="btn btn-outline-primary mt-2" onclick="document.getElementById('clear-filters').click()">Изчисти филтрите</button>
        </div>
      `;
      renderPagination(count || 0);
      return;
    }

    wrapper.innerHTML = properties.map(property => createListingCard(property)).join('');
    await initFavButtons(wrapper);
    renderPagination(count || 0);
    
  } catch (err) {
    console.error('Error loading listings:', err);
    wrapper.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-danger d-inline-block">
          Възникна грешка при зареждането на обявите.
        </div>
      </div>
    `;
    if (paginationWrapper) paginationWrapper.innerHTML = '';
  }
}

function renderPagination(totalCount) {
  const paginationWrapper = document.getElementById('pagination-wrapper');
  if (!paginationWrapper) return;

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);
  if (totalPages <= 1) {
    paginationWrapper.innerHTML = '';
    return;
  }

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + 4);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4);
    }
  }

  let pagesHtml = '';
  for (let page = startPage; page <= endPage; page++) {
    pagesHtml += `
      <li class="page-item ${page === currentPage ? 'active' : ''}">
        <button class="page-link" data-page="${page}">${page}</button>
      </li>
    `;
  }

  paginationWrapper.innerHTML = `
    <nav aria-label="Пагинация на обявите">
      <ul class="pagination justify-content-center mb-0">
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
          <button class="page-link" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Предишна</button>
        </li>
        ${pagesHtml}
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
          <button class="page-link" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Следваща</button>
        </li>
      </ul>
    </nav>
  `;
}

async function initFavButtons(wrapper) {
  const isAuthenticated = localStorage.getItem('pm_is_authenticated') === 'true';
  if (!isAuthenticated) return; // hide buttons for guests - they stay invisible

  // Show buttons now that user is logged in
  wrapper.querySelectorAll('.fav-toggle-btn').forEach(btn => btn.classList.remove('d-none'));

  // Fetch user's favorites
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: favs } = await supabase
    .from('favorites')
    .select('id, property_id')
    .eq('user_id', user.id);

  const favMap = {}; // property_id -> favorite id
  (favs || []).forEach(f => { favMap[f.property_id] = f.id; });

  // Update button states
  wrapper.querySelectorAll('.fav-toggle-btn').forEach(btn => {
    const propId = btn.dataset.propertyId;
    const isFav = !!favMap[propId];
    updateFavBtn(btn, isFav);
  });

  // Handle clicks
  wrapper.querySelectorAll('.fav-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const propId = btn.dataset.propertyId;
      const currentFavId = favMap[propId];
      btn.disabled = true;
      try {
        if (currentFavId) {
          await supabase.from('favorites').delete().eq('id', currentFavId);
          delete favMap[propId];
          updateFavBtn(btn, false);
        } else {
          const { data, error } = await supabase
            .from('favorites')
            .insert({ user_id: user.id, property_id: propId })
            .select()
            .single();
          if (error) throw error;
          favMap[propId] = data.id;
          updateFavBtn(btn, true);
        }
      } catch (err) {
        console.error('Fav toggle error:', err);
      } finally {
        btn.disabled = false;
      }
    });
  });
}

function updateFavBtn(btn, isFav) {
  btn.classList.toggle('btn-danger', isFav);
  btn.classList.toggle('btn-light', !isFav);
  btn.title = isFav ? 'Премахни от любими' : 'Добави в любими';
  btn.innerHTML = `<i class="bi bi-heart${isFav ? '-fill' : ''}"></i>`;
}

// Helper to keep old function signature working if called directly (though UI drives it now)
async function loadListings(category) {
  // Check if UI is rendered
  const form = document.getElementById('search-form');
  if(form) {
      filterListings();
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
  let priceFormatted = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(property.price);

  if (property.listing_type === 'rent') {
    priceFormatted += ' / месец';
  }

  // Translate types
  const typeMap = {
    'apartment': 'Апартамент',
    'studio': 'Студио',
    'house': 'Къща',
    'villa': 'Вила',
    'guest_house': 'Къща за гости'
  };
  
  const listingTypeMap = {
    'sale': 'Продажба',
    'rent': 'Наем'
  };
  
  const listingTypeBadgeMap = {
    'sale': 'bg-success',
    'rent': 'bg-info'
  };

  const propertyType = typeMap[property.property_type] || property.property_type;
  const listingType = listingTypeMap[property.listing_type] || property.listing_type;
  const badgeClass = listingTypeBadgeMap[property.listing_type] || 'bg-secondary';

  return `
    <div class="col-md-6 col-xl-4">
      <div class="card h-100 shadow-sm border-0 transition-hover rounded-4 overflow-hidden">
        <div class="position-relative">
          <img src="${coverImage}" class="card-img-top object-fit-cover" alt="${property.title}" style="height: 220px;">
          <div class="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-0 hover-opacity-10 transition-all"></div>
          <span class="position-absolute top-0 end-0 m-3 badge ${badgeClass} text-white shadow-sm px-3 py-2 rounded-pill">
            ${listingType}
          </span>
          ${property.is_active === false ? `
          <span class="position-absolute top-0 start-0 m-3 badge text-bg-warning shadow-sm px-3 py-2 rounded-pill">
            <i class="bi bi-eye-slash me-1"></i>Деактивирана
          </span>` : ''}
          <span class="position-absolute bottom-0 start-0 m-3 badge bg-dark bg-opacity-75 text-white shadow-sm px-2 py-1 rounded">
             <i class="bi bi-camera me-1"></i> ${property.property_images?.length || 0}
          </span>
          <button class="fav-toggle-btn d-none btn btn-light btn-sm position-absolute bottom-0 end-0 m-3 rounded-circle shadow-sm" style="z-index: 2; width: 36px; height: 36px; padding: 0;" data-property-id="${property.id}" title="Добави в любими">
            <i class="bi bi-heart"></i>
          </button>
        </div>
        <div class="card-body d-flex flex-column p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill px-2 py-1 small">
                ${propertyType}
            </span>
            <small class="text-muted"><i class="bi bi-clock me-1"></i>${new Date(property.created_at).toLocaleDateString()}</small>
          </div>
          
          <h5 class="card-title fw-bold text-truncate mb-1" title="${property.title}">
            <a href="#/property/${property.id}" class="text-decoration-none text-dark stretched-link">${property.title}</a>
          </h5>
          
          <p class="text-secondary small mb-3 text-truncate">
            <i class="bi bi-geo-alt-fill me-1 pm-accent-icon"></i>${property.city}, ${property.address}
          </p>
          
          <div class="mt-auto">
             <h4 class="text-primary fw-bold mb-3">${priceFormatted}</h4>
             
             <div class="d-flex justify-content-between border-top pt-3 text-secondary small">
               <span title="Площ"><i class="bi bi-arrows-fullscreen me-1"></i>${property.area_sq_m} м²</span>
               <span title="Стаи"><i class="bi bi-door-closed me-1"></i>${property.rooms} стаи</span>
               <span title="Цена на кв.м."><i class="bi bi-calculator me-1"></i>${(property.price / property.area_sq_m).toFixed(0)} €/м²</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

