import { supabase } from '../../services/supabaseClient/supabaseClient.js';
import { showPageFeedback } from '../../utils/ui.js';

export function createEditPropertyPage(id) {
  setTimeout(() => initEditPage(id), 0);

  return `
    <div class="container py-4" id="edit-property-container">
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Зареждане...</span>
        </div>
      </div>
    </div>
  `;
}

async function initEditPage(id) {
  const container = document.getElementById('edit-property-container');
  if (!container) return;
  loadPropertyForEdit(id, container);
}

async function loadPropertyForEdit(id, container) {
  if (!id) {
    container.innerHTML = `<div class="alert alert-danger">Невалиден ID.</div>`;
    return;
  }

  try {
    const { data: property, error } = await supabase
      .from('properties')
      .select('*, property_images(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!property) throw new Error('Имотът не е намерен.');

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

    if (user.id !== property.owner_id && !isAdmin) {
      container.innerHTML = `<div class="alert alert-danger">Нямате права да редактирате тази обява.</div>`;
      return;
    }

    const images = property.property_images || [];
    renderEditForm(container, property, images);

  } catch (err) {
    console.error('Error loading property:', err);
    container.innerHTML = `<div class="alert alert-danger">Грешка: ${err.message}</div>`;
  }
}

function renderEditForm(container, property, images) {
  container.innerHTML = `
    <div class="mb-3">
      <button onclick="history.back()" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i>Назад
      </button>
    </div>
    <section class="max-w-3xl mx-auto rounded-4 p-4 p-md-5 bg-white shadow-sm border">
      <h1 class="h3 fw-bold mb-4">Редакция на обява</h1>

      <form id="edit-property-form" class="needs-validation" novalidate>
        <div class="row g-3">

          <div class="col-12">
            <label for="prop-title" class="form-label fw-semibold">Заглавие на обявата</label>
            <input type="text" class="form-control" id="prop-title" value="${property.title}" required minlength="5" maxlength="100">
            <div class="invalid-feedback">Моля, въведете заглавие (мин. 5 символа).</div>
          </div>

          <div class="col-12">
            <label for="prop-desc" class="form-label fw-semibold">Описание</label>
            <textarea class="form-control" id="prop-desc" rows="5" required minlength="20">${property.description}</textarea>
            <div class="invalid-feedback">Описанието трябва да е поне 20 символа.</div>
          </div>

          <div class="col-md-6">
            <label for="prop-type" class="form-label fw-semibold">Тип имот</label>
            <select class="form-select" id="prop-type" required>
              <option value="apartment" ${property.property_type === 'apartment' ? 'selected' : ''}>Апартамент</option>
              <option value="house" ${property.property_type === 'house' ? 'selected' : ''}>Къща</option>
              <option value="villa" ${property.property_type === 'villa' ? 'selected' : ''}>Вила</option>
              <option value="guest_house" ${property.property_type === 'guest_house' ? 'selected' : ''}>Къща за гости</option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="listing-type" class="form-label fw-semibold">Вид обява</label>
            <select class="form-select" id="listing-type" required>
              <option value="sale" ${property.listing_type === 'sale' ? 'selected' : ''}>Продажба</option>
              <option value="rent" ${property.listing_type === 'rent' ? 'selected' : ''}>Наем</option>
            </select>
          </div>

          <div class="col-md-4">
            <label for="prop-price" class="form-label fw-semibold">Цена (€)</label>
            <input type="number" class="form-control" id="prop-price" value="${property.price}" required min="1">
          </div>

          <div class="col-md-4">
            <label for="prop-area" class="form-label fw-semibold">Площ (кв.м)</label>
            <input type="number" class="form-control" id="prop-area" value="${property.area_sq_m}" required min="1">
          </div>

          <div class="col-md-4">
            <label for="prop-rooms" class="form-label fw-semibold">Брой стаи</label>
            <input type="number" class="form-control" id="prop-rooms" value="${property.rooms}" required min="1">
          </div>

          <div class="col-md-6">
            <label for="prop-city" class="form-label fw-semibold">
              гр./с. [Име], общ. [Име], обл. [Име]
              <i class="bi bi-info-circle text-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="Пример: с. Марково, общ. Родопи, обл. Пловдив"></i>
            </label>
            <input type="text" class="form-control" id="prop-city" value="${property.city}" required>
          </div>

          <div class="col-md-6">
            <label for="prop-address" class="form-label fw-semibold">Адрес / Район</label>
            <input type="text" class="form-control" id="prop-address" value="${property.address}" required>
          </div>

          <div class="col-12 mt-2">
            <label class="form-label fw-semibold">Снимки на обявата</label>
            <div id="all-images-grid" class="d-flex flex-wrap gap-2 mb-2">
              ${images.map(img => `
                <div class="position-relative" id="img-card-${img.id}" style="width:110px;">
                  <img src="${img.image_url}" class="rounded border object-fit-cover w-100" style="height:80px;" alt="снимка">
                  ${img.is_cover ? '<span class="badge bg-primary position-absolute top-0 start-0 m-1" style="font-size:0.6rem;">корица</span>' : ''}
                  <button type="button"
                    class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0 d-flex align-items-center justify-content-center delete-img-btn"
                    data-img-id="${img.id}"
                    data-img-url="${img.image_url}"
                    data-is-cover="${img.is_cover}"
                    style="width:22px;height:22px;font-size:0.7rem;"
                    title="Премахни снимката">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              `).join('')}
            </div>
            <input type="file" class="form-control" id="prop-image" accept="image/*" multiple>
          </div>

          <div class="col-12 mt-4 d-flex justify-content-end gap-2">
            <a href="#/property/${property.id}" class="btn btn-secondary px-4">Отказ</a>
            <button class="btn btn-primary px-4 fw-bold d-flex align-items-center" type="submit">
              <span class="spinner-border spinner-border-sm me-2 d-none" role="status" aria-hidden="true"></span>
              <span class="submit-text">Запази промените</span>
            </button>
          </div>

        </div>
      </form>
    </section>
  `;

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(container.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  const deletedImages = []; // Track images to delete
  const form = container.querySelector('#edit-property-form');
  
  // Live preview for newly selected images
  const imageInput = container.querySelector('#prop-image');
  const allGrid = container.querySelector('#all-images-grid');
  let selectedFiles = [];

  imageInput.addEventListener('change', () => {
    const newFiles = Array.from(imageInput.files);
    newFiles.forEach(file => {
      if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
        selectedFiles.push(file);
        appendPreview(file);
      }
    });
    imageInput.value = '';
    syncInputFiles();
  });

  function appendPreview(file) {
    const url = URL.createObjectURL(file);
    const card = document.createElement('div');
    card.className = 'position-relative new-preview-card';
    card.style.cssText = 'width:110px;';
    card.innerHTML = `
      <img src="${url}" class="rounded border object-fit-cover w-100" style="height:80px;" alt="${file.name}">
      <span class="badge bg-success position-absolute top-0 start-0 m-1" style="font-size:0.6rem;">нова</span>
      <button type="button"
        class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0 d-flex align-items-center justify-content-center"
        style="width:22px;height:22px;font-size:0.7rem;"
        title="Премахни">
        <i class="bi bi-x-lg"></i>
      </button>
      <span class="d-block text-truncate text-secondary mt-1" style="font-size:0.6rem;max-width:110px;">${file.name}</span>
    `;
    card.querySelector('button').addEventListener('click', () => {
      URL.revokeObjectURL(url);
      selectedFiles = selectedFiles.filter(f => f !== file);
      card.remove();
      syncInputFiles();
    });
    allGrid.appendChild(card);
  }

  function syncInputFiles() {
    const dt = new DataTransfer();
    selectedFiles.forEach(f => dt.items.add(f));
    imageInput.files = dt.files;
  }

  // Handle deletion of existing images (mark for deletion)
  container.querySelectorAll('.delete-img-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const imgId = btn.dataset.imgId;
      const imgUrl = btn.dataset.imgUrl;
      const isCover = btn.dataset.isCover === 'true';
      
      // Add to deletion list
      deletedImages.push({ id: imgId, url: imgUrl, isCover });
      
      // Visual removal
      const card = document.getElementById(`img-card-${imgId}`);
      if (card) {
        card.style.display = 'none'; // Hide instead of remove to keep DOM for now if needed, or remove
        card.remove(); 
      }
    });
  });

  form.addEventListener('submit', (e) => handleEditSubmit(e, property.id, deletedImages));
}

// Old direct delete function removed/replaced by inline logic above
// async function handleDeleteImage... (not used anymore)

async function handleEditSubmit(e, propertyId, deletedImages = []) {
  e.preventDefault();
  const form = e.target;

  const titleInput = document.getElementById('prop-title');
  const descInput = document.getElementById('prop-desc');
  const cityInput = document.getElementById('prop-city');
  const addressInput = document.getElementById('prop-address');

  const updates = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    property_type: document.getElementById('prop-type').value,
    listing_type: document.getElementById('listing-type').value,
    price: parseFloat(document.getElementById('prop-price').value),
    area_sq_m: parseFloat(document.getElementById('prop-area').value),
    rooms: parseInt(document.getElementById('prop-rooms').value),
    city: cityInput.value.trim(),
    address: addressInput.value.trim()
  };

  if (!form.checkValidity() ||
      updates.title.length < 5 ||
      updates.description.length < 20 ||
      updates.city.length < 2 ||
      updates.address.length < 5 ||
      updates.price <= 0 ||
      updates.area_sq_m <= 0 ||
      updates.rooms <= 0) {

    e.stopPropagation();
    form.classList.add('was-validated');

    if (updates.description.length < 20) {
      showPageFeedback('danger', 'Описанието трябва да е поне 20 символа.');
    } else if (updates.title.length < 5) {
      showPageFeedback('danger', 'Заглавието трябва да е поне 5 символа.');
    } else if (updates.city.length < 2) {
      showPageFeedback('danger', 'Градът трябва да е поне 2 символа.');
    } else if (updates.address.length < 5) {
      showPageFeedback('danger', 'Адресът трябва да е поне 5 символа.');
    } else if (updates.price <= 0 || updates.area_sq_m <= 0 || updates.rooms <= 0) {
      showPageFeedback('danger', 'Моля, въведете валидни стойности за цена, площ и стаи.');
    } else {
      showPageFeedback('danger', 'Моля, попълнете коректно всички полета.');
    }
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const spinner = submitBtn.querySelector('.spinner-border');
  const submitText = submitBtn.querySelector('.submit-text');
  const imageInput = document.getElementById('prop-image');
  const imageFiles = imageInput && imageInput.files ? Array.from(imageInput.files) : [];

  try {
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    submitText.textContent = 'Запазване...';

    // 1. Update property data
    const { error: updateError } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId);

    if (updateError) throw updateError;

    // 2. Process image deletions
    if (deletedImages.length > 0) {
      const idsToDelete = deletedImages.map(img => img.id);
      
      // Delete from DB
      const { error: delErr } = await supabase
        .from('property_images')
        .delete()
        .in('id', idsToDelete);
        
      if (delErr) throw delErr;

      // Delete from Storage (fire and forget / robust effort)
      const pathsToDelete = deletedImages.map(img => {
        try {
          const url = new URL(img.url);
          // Assuming url structure .../properties/FOLDER/FILE
          const token = '/properties/';
          const idx = url.pathname.indexOf(token);
          if (idx !== -1) {
            return url.pathname.substring(idx + token.length);
          }
        } catch (e) { console.error('Error parsing url', e); }
        return null;
      }).filter(p => p !== null);

      if (pathsToDelete.length > 0) {
        await supabase.storage.from('properties').remove(pathsToDelete);
      }
    }

    // 3. Upload new images if any
    const { data: existingImgs } = await supabase
      .from('property_images')
      .select('id, is_cover')
      .eq('property_id', propertyId);
      
    const hasCover = existingImgs && existingImgs.some(img => img.is_cover);

    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}/${Date.now()}_${index}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('properties').getPublicUrl(fileName);

        // If no cover currently exists, make the first new image the cover
        const isCover = !hasCover && index === 0;

        return supabase.from('property_images').insert({
          property_id: propertyId,
          image_url: data.publicUrl,
          is_cover: isCover
        });
      });

      await Promise.all(uploadPromises);
    } else if (!hasCover && existingImgs && existingImgs.length > 0) {
      // If we deleted the cover and didn't add new images, promote one of the remaining
      await supabase
        .from('property_images')
        .update({ is_cover: true })
        .eq('id', existingImgs[0].id);
    }

    showPageFeedback('success', 'Промените са запазени успешно!');
    setTimeout(() => {
      window.location.hash = `#/property/${propertyId}`;
    }, 1500);

  } catch (err) {
    console.error('Update error:', err);
    showPageFeedback('danger', 'Грешка при обновяване: ' + err.message);
    submitBtn.disabled = false;
    spinner.classList.add('d-none');
    submitText.textContent = 'Запази промените';
  }
}