export function createHeader(currentPath = '/') {
  const isListingsActive = [
    '/listings',
    '/listings-sales',
    '/listings-rent',
  ].includes(currentPath);

  // Check auth state from localStorage (sync logic for immediate render)
  const isAuthenticated = localStorage.getItem('pm_is_authenticated') === 'true';
  const role = localStorage.getItem('pm_user_role');
  const isAdmin = role === 'admin';

  let navItems = `
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
        <li><a class="dropdown-item" href="#/listings">Всички</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#/listings-sales">Продажби</a></li>
        <li><a class="dropdown-item" href="#/listings-rent">Наеми</a></li>
      </ul>
    </li>
  `;

  if (isAuthenticated) {
    navItems += `
      <li class="nav-item">
        <a class="nav-link ${currentPath === '/create-property' ? 'active' : ''} text-primary fw-semibold" href="#/create-property">
          <i class="bi bi-plus-circle me-1"></i>Добави обява
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${currentPath === '/favorites' ? 'active' : ''}" href="#/favorites">Любими</a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${currentPath === '/profile' ? 'active' : ''}" href="#/profile">Профил</a>
      </li>
    `;

    if (isAdmin) {
      navItems += `
        <li class="nav-item">
          <a class="nav-link ${currentPath === '/admin' ? 'active' : ''} text-danger" href="#/admin">Админ</a>
        </li>
      `;
    }
  } else {
    // Guest view: Login / Register buttons
    navItems += `
      <li class="nav-item ms-lg-2">
        <a class="btn btn-outline-primary btn-sm px-3" href="#/login">Вход</a>
      </li>
      <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
        <a class="btn btn-primary btn-sm px-3" href="#/register">Регистрация</a>
      </li>
    `;
  }

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
          <ul class="navbar-nav ms-auto gap-lg-2 align-items-lg-center">
            ${navItems}
          </ul>
        </div>
      </nav>
    </header>
  `;
}
