export function createHeader(currentPath = '/') {
  const isListingsActive = [
    '/listings',
    '/listings-sales',
    '/listings-rent',
  ].includes(currentPath);

  const navMarkup = `
    <li class="nav-item">
      <a class="nav-link ${currentPath === '/' ? 'active' : ''}" href="#/">Начало</a>
    </li>
    <li class="nav-item">
      <a class="nav-link ${currentPath === '/about' ? 'active' : ''}" href="#/about">За нас</a>
    </li>
    <li class="nav-item dropdown">
      <a
        class="nav-link dropdown-toggle ${isListingsActive ? 'active' : ''}"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        Обяви
      </a>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#/listings-sales">Продажби</a></li>
        <li><a class="dropdown-item" href="#/listings-rent">Наеми</a></li>
      </ul>
    </li>
    <li class="nav-item">
      <a class="nav-link ${currentPath === '/favorites' ? 'active' : ''}" href="#/favorites">Любими</a>
    </li>
    <li class="nav-item">
      <a class="nav-link ${currentPath === '/profile' ? 'active' : ''}" href="#/profile">Профил</a>
    </li>
    <li class="nav-item">
      <a class="nav-link ${currentPath === '/admin' ? 'active' : ''}" href="#/admin">Админ</a>
    </li>
    <li class="nav-item">
      <a class="nav-link ${currentPath === '/login' ? 'active' : ''}" href="#/login">Вход</a>
    </li>
    <li class="nav-item">
      <a class="nav-link ${currentPath === '/register' ? 'active' : ''}" href="#/register">Регистрация</a>
    </li>
  `;

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
          <ul class="navbar-nav ms-auto gap-lg-2 align-items-lg-center">${navMarkup}</ul>
        </div>
      </nav>
    </header>
  `;
}
