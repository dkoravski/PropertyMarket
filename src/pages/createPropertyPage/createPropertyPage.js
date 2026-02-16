import { supabase } from '../../services/supabaseClient/supabaseClient.js';

export function createPropertyPage() {
  setTimeout(initCreatePropertyPage, 0);

  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-4">Добави нова обява</h1>
      
      <form id="create-property-form" class="row g-3" novalidate>
        <!-- Basic Info -->
        <div class="col-12">
          <label for="prop-title" class="form-label">Заглавие на обявата *</label>
          <input type="text" class="form-control" id="prop-title" placeholder="Напр. Тристаен апартамен в центъра" required minlength="5" maxlength="160">
        </div>

        <div class="col-12">
          <label for="prop-desc" class="form-label">Описание *</label>
          <textarea class="form-control" id="prop-desc" rows="4" placeholder="Детайлно описание на имота..." required minlength="20"></textarea>
        </div>

        <!-- Types -->
        <div class="col-md-6">
          <label for="prop-type" class="form-label">Тип имот *</label>
          <select id="prop-type" class="form-select" required>
            <option value="" selected disabled>Изберете...</option>
            <option value="apartment">Апартамент</option>
            <option value="house">Къща</option>
            <option value="villa">Вила</option>
            <option value="guest_house">Къща за гости</option>
          </select>
        </div>

        <div class="col-md-6">
          <label for="listing-type" class="form-label">Вид обява *</label>
          <select id="listing-type" class="form-select" required>
            <option value="" selected disabled>Изберете...</option>
            <option value="sale">Продажба</option>
            <option value="rent">Наем</option>
          </select>
        </div>

        <!-- Details -->
        <div class="col-md-4">
          <label for="prop-price" class="form-label">Цена (BGN/EUR) *</label>
          <input type="number" class="form-control" id="prop-price" min="1" step="0.01" required>
        </div>

        <div class="col-md-4">
          <label for="prop-area" class="form-label">Площ (кв.м) *</label>
          <input type="number" class="form-control" id="prop-area" min="1" step="0.01" required>
        </div>

        <div class="col-md-4">
          <label for="prop-rooms" class="form-label">Брой стаи *</label>
          <input type="number" class="form-control" id="prop-rooms" min="1" step="1" required>
        </div>

        <!-- Location -->
        <div class="col-md-6">
          <label for="prop-city" class="form-label">Град *</label>
          <input type="text" class="form-control" id="prop-city" required minlength="2">
        </div>

        <div class="col-md-6">
          <label for="prop-address" class="form-label">Адрес *</label>
          <input type="text" class="form-control" id="prop-address" required minlength="5">
        </div>

        <!-- Image Upload -->
        <div class="col-12">
          <label for="prop-image" class="form-label">Снимка на имота *</label>
          <input class="form-control" type="file" id="prop-image" accept="image/*" required>
          <div class="form-text">Изберете основна снимка за имота (JPG, PNG).</div>
        </div>

        <!-- Submit -->
        <div class="col-12 mt-4">
          <button type="submit" class="btn btn-primary w-100 py-2">
            <span class="submit-text">Публикувай обявата</span>
            <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
          </button>
        </div>
      </form>
    </section>
  `;
}

function initCreatePropertyPage() {
  const form = document.getElementById('create-property-form');
  if (form) {
    form.addEventListener('submit', handleCreateProperty);
  }
}

async function handleCreateProperty(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const spinner = submitBtn.querySelector('.spinner-border');
  const submitText = submitBtn.querySelector('.submit-text');

  // Input elements
  const title = document.getElementById('prop-title').value.trim();
  const description = document.getElementById('prop-desc').value.trim();
  const type = document.getElementById('prop-type').value;
  const listingType = document.getElementById('listing-type').value;
  const price = parseFloat(document.getElementById('prop-price').value);
  const area = parseFloat(document.getElementById('prop-area').value);
  const rooms = parseInt(document.getElementById('prop-rooms').value);
  const city = document.getElementById('prop-city').value.trim();
  const address = document.getElementById('prop-address').value.trim();
  const imageFile = document.getElementById('prop-image').files[0];

  if (!imageFile) {
    alert('Моля, изберете снимка за имота.');
    return;
  }

  try {
    // UI Loading state
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    submitText.textContent = 'Публикуване...';

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Трябва да сте влезли в профила си.');

    // 2. Insert Property Data
    const { data: propertyData, error: propError } = await supabase
      .from('properties')
      .insert({
        owner_id: user.id,
        title,
        description,
        property_type: type,
        listing_type: listingType,
        price,
        area_sq_m: area,
        rooms,
        city,
        address
      })
      .select()
      .single();

    if (propError) throw propError;
    
    const propertyId = propertyData.id;

    // 3. Upload Image to Storage
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${propertyId}/cover.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('properties')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    // 4. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);

    // 5. Save Image Record
    const { error: imgError } = await supabase
      .from('property_images')
      .insert({
        property_id: propertyId,
        image_url: publicUrl,
        is_cover: true
      });

    if (imgError) throw imgError;

    // Success
    alert('Обявата е създадена успешно!');
    window.location.hash = '#/listings';

  } catch (err) {
    console.error('Error creating property:', err);
    alert('Възникна грешка: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    spinner.classList.add('d-none');
    submitText.textContent = 'Публикувай обявата';
  }
}
