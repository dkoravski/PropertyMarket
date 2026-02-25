import '../../styles/pages/contactsPage.css';

export function createContactsPage() {
  return `
    <div class="mb-3">
      <button onclick="history.back()" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i>Назад
      </button>
    </div>
    <section class="contacts-surface rounded-4 p-4 p-md-5 bg-white border">
      <h1 class="h3 fw-bold mb-3">Контакти</h1>
      <p class="mb-4 text-secondary">
        Свържете се с екипа на PropertyMarket за въпроси, съдействие и партньорства.
      </p>

      <div class="row g-3">
        <div class="col-12 col-md-6">
          <div class="p-3 rounded-3 border h-100 bg-light">
            <h2 class="h6 fw-semibold mb-2">Имейл</h2>
            <p class="mb-0"><a href="mailto:contact@propertymarket.com" class="link-primary">contact@propertymarket.com</a></p>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="p-3 rounded-3 border h-100 bg-light">
            <h2 class="h6 fw-semibold mb-2">Телефон</h2>
            <p class="mb-0"><a href="tel:+359888123456" class="link-primary">+359 888 123 456</a></p>
          </div>
        </div>
        <div class="col-12">
          <div class="p-3 rounded-3 border bg-light">
            <h2 class="h6 fw-semibold mb-2">Адрес</h2>
            <p class="mb-0">гр. София, бул. „Витоша“ 100</p>
          </div>
        </div>
      </div>
    </section>
  `;
}
