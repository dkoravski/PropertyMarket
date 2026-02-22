import '../../styles/pages/propertyDetailsPage.css';
import { supabase } from '../../services/supabaseClient/supabaseClient.js';
import { showConfirmModal, showPageFeedback } from '../../utils/ui.js';

export function createPropertyDetailsPage(id) {
  setTimeout(() => loadPropertyDetails(id), 0);

  return `
    <div id="property-details-container" class="container py-4">
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Зареждане...</span>
        </div>
      </div>
    </div>
  `;
}

async function loadPropertyDetails(id) {
  const container = document.getElementById('property-details-container');
  if (!container) return; // Guard clause if navigation changed

  if (!id) {
    container.innerHTML = `
      <div class="alert alert-danger">
        Невалиден идентификатор на имот.
        <a href="#/listings" class="alert-link">Към всички обяви</a>.
      </div>
    `;
    return;
  }

  try {
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          image_url,
          is_cover
        ),
        profiles:owner_id (
          full_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    const { data: { user } } = await supabase.auth.getUser();
    
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      isAdmin = profile?.role === 'admin';
    }

    const isOwner = user && user.id === property.owner_id;
    const canEdit = isOwner || isAdmin;

    // Check favorites
    let isFavorited = false;
    let favoriteId = null;
    if (user) {
      const { data: fav } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', id)
        .maybeSingle();
      if (fav) {
        isFavorited = true;
        favoriteId = fav.id;
      }
    }

    renderDetails(container, property, user, canEdit, isAdmin, isFavorited, favoriteId);

  } catch (err) {
    console.error('Error loading details:', err);
    container.innerHTML = `
      <div class="alert alert-danger">
        Възникна грешка: ${err.message || 'Неизвестна грешка'}
        <br>
        <a href="#/listings" class="btn btn-outline-primary mt-3">Към всички обяви</a>
      </div>
    `;
  }
}

function renderDetails(container, property, user, canEdit, isAdmin, isFavorited, favoriteId) {
  const images = property.property_images || [];
  images.sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0));
  const coverUrl = images.length > 0 ? images[0].image_url : 'https://via.placeholder.com/800x500?text=No+Image';
  const carouselId = `property-carousel-${property.id}`;

  let price = new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price);
  if (property.listing_type === 'rent') {
    price += ' / месец';
  }
  const typeMap = { 'apartment': 'Апартамент', 'studio': 'Студио', 'house': 'Къща', 'villa': 'Вила', 'guest_house': 'Къща за гости' };
  const listingMap = { 'sale': 'Продажба', 'rent': 'Наем' };

  const ownerName = property.profiles?.full_name || 'Неизвестен';
  const ownerEmail = property.profiles?.email || '';
  const ownerPhone = property.profiles?.phone || '';

  container.innerHTML = `
    <div class="mb-3">
      <button id="btn-back-nav" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1 pm-accent-icon"></i>Назад
      </button>
    </div>
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="position-relative mb-4 details-main-card rounded-4">
          <div id="${carouselId}" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="3000" data-bs-touch="true">
            ${images.length > 1 ? `
              <div class="carousel-indicators">
                ${images.map((_, index) => `
                  <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" class="${index === 0 ? 'active' : ''}" ${index === 0 ? 'aria-current="true"' : ''} aria-label="Снимка ${index + 1}"></button>
                `).join('')}
              </div>
            ` : ''}

            <div class="carousel-inner rounded-4 overflow-hidden">
              ${(images.length > 0 ? images : [{ image_url: coverUrl }]).map((img, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                  <img src="${img.image_url}" class="d-block w-100 object-fit-cover property-carousel-image" alt="${property.title} - снимка ${index + 1}">
                </div>
              `).join('')}
            </div>

            ${images.length > 1 ? `
              <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Предишна</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Следваща</span>
              </button>
            ` : ''}
          </div>

          <span class="position-absolute top-0 end-0 m-3 z-3 text-white fw-semibold" style="pointer-events: none; text-shadow: 0 1px 3px rgba(0,0,0,0.75);">
            ${listingMap[property.listing_type]}
          </span>
          ${property.is_active === false ? `
          <span class="position-absolute top-0 start-0 m-3 z-3 badge text-bg-warning shadow-sm px-3 py-2">
            <i class="bi bi-eye-slash-fill me-1 pm-photo-icon"></i>Деактивирана
          </span>` : ''}
        </div>
      </div>

      <div class="col-lg-4">
        <div class="details-contact-card details-side-card card border-0 rounded-4 mb-3">
          <div class="card-body p-3">
            <h5 class="details-side-title fw-bold mb-2">Контакт със собственика</h5>
            <div class="d-flex align-items-center mb-3">
              <div class="details-owner-avatar rounded-circle bg-primary bg-opacity-10 me-3 text-primary d-flex align-items-center justify-content-center">
                <i class="bi bi-person-fill pm-accent-icon"></i>
              </div>
              <div>
                <div class="details-owner-name fw-bold">${ownerName}</div>
                <div class="small text-secondary">Собственик</div>
              </div>
            </div>
            
            <div class="d-grid gap-2">
              <a href="mailto:${ownerEmail}" class="btn btn-outline-primary details-side-btn d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-envelope pm-accent-icon"></i> ${ownerEmail}
              </a>
              ${ownerPhone ? `
                <a href="tel:${ownerPhone}" class="btn btn-outline-primary details-side-btn d-flex align-items-center justify-content-center gap-2">
                  <i class="bi bi-telephone pm-accent-icon"></i> ${ownerPhone}
                </a>
              ` : ''}
            </div>
          </div>
        </div>

        ${user ? `
          <button id="btn-fav" class="btn btn-outline-primary details-fav-btn w-100 rounded-4 fw-semibold transition-all mb-3">
            <i class="bi bi-heart${isFavorited ? '-fill' : ''} me-2 pm-accent-icon"></i>
            ${isFavorited ? 'Премахни от любими' : 'Добави в любими'}
          </button>
        ` : `
          <div class="alert alert-light border text-center rounded-4 mb-3">
            <a href="#/login" class="fw-bold">Влезте в системата</a>, за да запазите тази обява в любими.
          </div>
        `}

        ${canEdit ? `
          <div class="details-manage-card details-side-card card border-0 rounded-4 mb-0">
            <div class="card-body p-3">
              <h5 class="details-side-title fw-bold mb-2">Управление</h5>
              <div class="d-grid gap-2">
                <a href="#/edit-property/${property.id}" class="btn btn-outline-primary details-side-btn">
                  <i class="bi bi-pencil-square me-2 pm-accent-icon"></i>Редактирай
                </a>
                <button id="btn-delete" class="btn btn-outline-danger details-side-btn">
                  <i class="bi bi-trash me-2 pm-accent-icon"></i>Изтрий
                </button>
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="col-12">

        <div class="row g-3 align-items-stretch details-header-row mb-3">
          <div class="col-md-8">
            <div class="details-title-block d-flex justify-content-between align-items-start rounded-4 bg-white shadow-sm h-100 mb-0">
              <div>
                <h1 class="fw-bold mb-1">${property.title}</h1>
                <p class="text-secondary fs-5"><i class="bi bi-geo-alt-fill me-1 pm-accent-icon"></i>${property.city}, ${property.address}</p>
              </div>
              <div class="text-end ms-3 flex-shrink-0">
                <div class="h2 fw-bold text-primary mb-0">${price}</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="details-info-card card border-0 shadow-sm rounded-4 h-100 mb-0">
              <div class="card-body">
                <div class="details-facts-stack">
                  <div class="details-fact-item">
                    <span class="details-fact-label">Площ</span>
                    <span class="details-fact-value">${property.area_sq_m} м²</span>
                  </div>
                  <div class="details-fact-item">
                    <span class="details-fact-label">Стаи</span>
                    <span class="details-fact-value">${property.rooms}</span>
                  </div>
                  <div class="details-fact-item">
                    <span class="details-fact-label">Тип</span>
                    <span class="details-fact-value">${typeMap[property.property_type]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="details-description-card card border-0 shadow-sm rounded-4 mb-5">
          <div class="card-body p-4">
            <h4 class="fw-bold mb-3">Описание</h4>
            <p class="text-secondary mb-0" style="white-space: pre-wrap; line-height: 1.6;">${property.description}</p>
          </div>
        </div>
      </div>

    </div>
  `;

  // Back button
  const btnBackNav = container.querySelector('#btn-back-nav');
  if (btnBackNav) {
    btnBackNav.addEventListener('click', () => {
      const dest = sessionStorage.getItem('pm_back_dest');
      if (dest === 'admin-properties') {
        sessionStorage.removeItem('pm_back_dest');
        sessionStorage.setItem('pm_admin_tab', 'properties');
        window.location.hash = '#/admin';
      } else {
        history.back();
      }
    });
  }

  // Events
  const btnDelete = container.querySelector('#btn-delete');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      const isConfirmed = await showConfirmModal('Сигурни ли сте, че искате да изтриете тази обява?');
      if (!isConfirmed) return;

      try {
        // 1. Delete images from storage first
        if (property.property_images && property.property_images.length > 0) {
          const paths = property.property_images.map(img => {
             const url = img.image_url;
             // Extract path relative to bucket 'properties'
             // Assuming URL format: .../storage/v1/object/public/properties/PATH
             const token = '/properties/';
             const idx = url.indexOf(token);
             if (idx !== -1) {
               return url.substring(idx + token.length);
             }
             return null;
          }).filter(p => p !== null);

          if (paths.length > 0) {
            const { error: storageError } = await supabase.storage
              .from('properties')
              .remove(paths);
            
            if (storageError) {
              console.warn('Could not delete images from storage:', storageError);
              // We continue to delete the record anyway
            }
          }
        }

        // 2. Delete property record
        const { error } = await supabase.from('properties').delete().eq('id', property.id);
        if (error) throw error;
        
        showPageFeedback('success', 'Обявата е изтрита успешно!');
        setTimeout(() => {
          window.location.hash = '#/listings';
        }, 500);
      } catch (err) {
        showPageFeedback('danger', 'Грешка: ' + err.message);
      }
    });
  }

  const btnFav = container.querySelector('#btn-fav');
  if (btnFav) {
    btnFav.addEventListener('click', async () => {
      try {
        btnFav.disabled = true;
        if (isFavorited) {
          await supabase.from('favorites').delete().eq('id', favoriteId);
          isFavorited = false;
          favoriteId = null;
          showPageFeedback('info', 'Премахнато от любими');
        } else {
          const { data, error } = await supabase.from('favorites').insert({ user_id: user.id, property_id: property.id }).select().single();
          if (error) throw error;
          isFavorited = true;
          favoriteId = data.id;
          showPageFeedback('success', 'Добавено в любими');
        }
        // Update UI
        btnFav.className = `btn btn-outline-primary details-fav-btn w-100 rounded-4 fw-semibold`;
        btnFav.innerHTML = `<i class="bi bi-heart${isFavorited ? '-fill' : ''} me-2 pm-accent-icon"></i>${isFavorited ? 'Премахни от любими' : 'Добави в любими'}`;
      } catch (err) {
        console.error(err);
        showPageFeedback('danger', 'Възникна грешка.');
      } finally {
        btnFav.disabled = false;
      }
    });
  }

  // Initialize Carousel manually to ensure it autoplays immediately
  const carouselEl = document.getElementById(carouselId);
  if (carouselEl) {
    const carousel = new bootstrap.Carousel(carouselEl, {
      interval: 4000,
      ride: 'carousel'
    });
    // Force start cycling
    carousel.cycle();
  }
}

// Modal function deleted to use shared utils/ui.js


