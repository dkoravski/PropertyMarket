export function createHeader(currentPath = '/') {
  const navItems = [
    { path: '/', label: 'Начало' },
    { path: '/about', label: 'За нас' },
    { path: '/listings', label: 'Обяви' },
    { path: '/favorites', label: 'Любими' },
    { path: '/profile', label: 'Профил' },
    { path: '/admin', label: 'Админ' },
    { path: '/login', label: 'Вход' },
    { path: '/register', label: 'Регистрация' },
  ];

  const navMarkup = navItems
    .map(
      ({ path, label }) => `
        <li class="nav-item">
          <a class="nav-link ${currentPath === path ? 'active' : ''}" href="#${path}">${label}</a>
        </li>
      `
    )
    .join('');

  return `
    <header class="bg-white border-bottom shadow-sm sticky-top">
      <nav class="navbar navbar-expand-lg container py-2">
        <a class="navbar-brand fw-bold text-primary" href="#/">PropertyMarket</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#main-nav"
          aria-controls="main-nav"
          aria-expanded="false"
          aria-label="Превключване на навигацията"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="main-nav">
          <ul class="navbar-nav ms-auto gap-lg-2">${navMarkup}</ul>
        </div>
      </nav>
    </header>
  `;
}
