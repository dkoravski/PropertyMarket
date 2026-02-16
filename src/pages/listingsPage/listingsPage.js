export function createListingsPage(category = 'Всички обяви') {
  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Обяви за имоти</h1>
      <p class="mb-2 text-secondary">Категория: <strong>${category}</strong></p>
      <p class="mb-0 text-secondary">Тук ще се визуализират публикуваните обяви.</p>
    </section>
  `;
}
