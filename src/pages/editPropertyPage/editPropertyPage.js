import { supabase } from '../../services/supabaseClient/supabaseClient.js';

export function createEditPropertyPage(id) {
  const container = document.createElement('div');
  container.className = 'container py-4';
  container.id = 'edit-property-container';

  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Зареждане...</span>
      </div>
    </div>
  `;

  loadPropertyForEdit(id, container);

  return container;
}

async function loadPropertyForEdit(id, container) {
  if (!id) {
    container.innerHTML = `<div class="alert alert-danger">Невалиден ID.</div>`;
    return;
  }

  try {
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!property) throw new Error('Имотът не е намерен.');

    // Check permissions (redundant with RLS but good for UX)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if admin
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

    renderEditForm(container, property);

  } catch (err) {
    console.error('Error loading property:', err);
    container.innerHTML = `<div class="alert alert-danger">Грешка: ${err.message}</div>`;
  }
}

function renderEditForm(container, property) {
  container.innerHTML = `
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
            <label for="prop-city" class="form-label fw-semibold">Град / Населено място</label>
            <input type="text" class="form-control" id="prop-city" value="${property.city}" required>
          </div>

          <div class="col-md-6">
            <label for="prop-address" class="form-label fw-semibold">Адрес / Район</label>
            <input type="text" class="form-control" id="prop-address" value="${property.address}" required>
          </div>

          <!-- Future improvement: Allow adding more images -->
          <div class="col-12 mt-4">
            <div class="p-3 bg-light rounded text-center">
              <span class="text-secondary small">Промяна на корица (по избор)</span>
              <input type="file" class="form-control mt-2" id="prop-image" accept="image/*">
            </div>
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

  const form = container.querySelector('#edit-property-form');
  form.addEventListener('submit', (e) => handleEditSubmit(e, property.id));
}

async function handleEditSubmit(e, propertyId) {
  e.preventDefault();
  const form = e.target;
  
  if (!form.checkValidity()) {
    e.stopPropagation();
    form.classList.add('was-validated');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const spinner = submitBtn.querySelector('.spinner-border');
  const submitText = submitBtn.querySelector('.submit-text');
  
  // Inputs
  const updates = {
    title: document.getElementById('prop-title').value.trim(),
    description: document.getElementById('prop-desc').value.trim(),
    property_type: document.getElementById('prop-type').value,
    listing_type: document.getElementById('listing-type').value,
    price: parseFloat(document.getElementById('prop-price').value),
    area_sq_m: parseFloat(document.getElementById('prop-area').value),
    rooms: parseInt(document.getElementById('prop-rooms').value),
    city: document.getElementById('prop-city').value.trim(),
    address: document.getElementById('prop-address').value.trim(),
    // updated_at is handled by DB? Usually manual or trigger. Let's rely on default or set it.
    // Supabase doesn't auto-update updated_at unless trigger exists.
    // Assuming simple update.
  };

  const imageFile = document.getElementById('prop-image').files[0];

  try {
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    submitText.textContent = 'Запазване...';

    // 1. Update Property Data
    const { error: updateError } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId);

    if (updateError) throw updateError;

    // 2. Handle Image if new one selected
    if (imageFile) {
      // Upload new image
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(fileName);

      // Set old covers to false
      await supabase
        .from('property_images')
        .update({ is_cover: false })
        .eq('property_id', propertyId);

      // Insert new cover
      const { error: imgError } = await supabase
        .from('property_images')
        .insert({
           property_id: propertyId,
           image_url: publicUrl,
           is_cover: true
        });

      if (imgError) throw imgError;
    }

    alert('Промените са запазени успешно!');
    window.location.hash = `#/property/${propertyId}`;

  } catch (err) {
    console.error('Update error:', err);
    alert('Грешка при обновяване: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    spinner.classList.add('d-none');
    submitText.textContent = 'Запази промените';
  }
}

