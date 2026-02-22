import '../../styles/pages/aboutPage.css';

export function createAboutPage() {
  return `
    <div class="mb-3">
      <button onclick="history.back()" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i>Назад
      </button>
    </div>
    <section class="about-surface rounded-4 p-4 p-md-5 bg-white border">
      <h1 class="h3 fw-bold mb-3">За нас</h1>
      <p class="mb-3 text-secondary">
        PropertyMarket е модерна платформа за покупка, продажба и отдаване под наем на жилищни имоти.
      </p>
      <p class="mb-3 text-secondary">
        Нашата мисия е да свързваме собственици, агенти и купувачи чрез ясни обяви, удобна навигация и надеждна информация.
      </p>
      <p class="mb-0 text-secondary">
        Работим за сигурно и приятно потребителско изживяване, за да откриете своя следващ дом по-лесно и по-бързо.
      </p>
    </section>
  `;
}
