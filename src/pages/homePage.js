export function createHomePage() {
  return `
    <section class="hero-section rounded-4 p-4 p-md-5 mb-4 bg-light border">
      <h1 class="display-6 fw-bold mb-3">Намерете следващия си дом с PropertyMarket</h1>
      <p class="lead text-secondary mb-4">
        Разгледайте апартаменти, къщи, вили и още имоти в удобна и модерна платформа.
      </p>
      <a href="#/listings" class="btn btn-primary btn-lg">Разгледай обявите</a>
    </section>

    <section aria-label="Препоръчани обяви">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h4 mb-0">Препоръчани имоти</h2>
        <a href="#/listings" class="link-primary text-decoration-none">Виж всички</a>
      </div>
      <div class="row g-3">
        ${createPropertyCard('Модерен апартамент', 'София', '€145,000')}
        ${createPropertyCard('Семейна къща', 'Пловдив', '€220,000')}
        ${createPropertyCard('Уютно студио', 'Варна', '€95,000')}
      </div>
    </section>
  `;
}

function createPropertyCard(title, location, price) {
  return `
    <article class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm border-0">
        <div class="card-body">
          <h3 class="h5 card-title mb-2">${title}</h3>
          <p class="mb-1 text-muted">${location}</p>
          <p class="fw-semibold mb-0">${price}</p>
        </div>
      </div>
    </article>
  `;
}
