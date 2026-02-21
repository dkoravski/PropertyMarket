
export function createHeader(currentPath = '/') {
  const normalizedPath = currentPath.split('#')[0].split('?')[0];

  const isListingsActive = [
    '/listings',
    '/listings-sales',
    '/listings-rent',
  ].includes(normalizedPath);

  const isCreatePropertyActive = normalizedPath === '/create-property';

  // Check auth state from localStorage (sync logic for immediate render)
  const isAuthenticated = localStorage.getItem('pm_is_authenticated') === 'true';
  const role = localStorage.getItem('pm_user_role');
  const isAdmin = role === 'admin';
  const userName = localStorage.getItem('pm_user_name') || '';
  const userEmail = localStorage.getItem('pm_user_email') || '';
  const profileTooltip = userName || userEmail || 'Вписан потребител';

  // Navigation Links (Left side)
  let navLinks = `
    <li class="nav-item">
      <a class="nav-link header-menu-link ${normalizedPath === '/' ? 'active' : ''}" href="#/">Начало</a>
    </li>
    <li class="nav-item">
      <a class="nav-link header-menu-link ${isListingsActive ? 'active' : ''}" href="#/listings">Обяви</a>
    </li>
    <li class="nav-item">
      <a class="nav-link header-menu-link ${normalizedPath === '/about' ? 'active' : ''}" href="#/about">За нас</a>
    </li>
  `;

  // Action Buttons (Right side)
  let authButtons = '';

  if (isAuthenticated) {
    // User is logged in
    authButtons = `
      <li class="nav-item me-2">
        <a class="nav-link header-menu-link position-relative ${normalizedPath === '/favorites' ? 'active' : ''}" href="#/favorites" title="Любими">
          <i class="bi bi-heart${normalizedPath === '/favorites' ? '-fill' : ''} fs-5"></i>
          <span class="ms-1 d-lg-inline">Любими</span>
        </a>
      </li>
      <li class="nav-item dropdown me-2">
        <a class="nav-link header-menu-link dropdown-toggle d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" title="${profileTooltip}">
          <i class="bi bi-person-circle fs-5"></i>
          <span class="d-none d-lg-inline">Профил</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end border-0 shadow-sm">
          <li><a class="dropdown-item header-dropdown-item" href="#/profile">Моят Профил</a></li>
          <li><a class="dropdown-item header-dropdown-item" href="#/my-listings">Моите Обяви</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item header-dropdown-item" href="#" onclick="window.pmLogout && window.pmLogout(); return false;">Изход</a></li>
        </ul>
      </li>
      ${isAdmin ? `
      <li class="nav-item me-2">
        <a class="nav-link header-menu-link fw-semibold ${normalizedPath === '/admin' ? 'active' : ''}" href="#/admin">
          <i class="bi bi-shield-lock-fill me-1"></i>Админ панел
        </a>
      </li>` : ''}
      <li class="nav-item ms-2">
        <a class="nav-link header-menu-link d-flex align-items-center gap-1 ${isCreatePropertyActive ? 'active' : ''}" href="#/create-property">
          <i class="bi bi-plus-lg me-1"></i>Добави обява
        </a>
      </li>
    `;
  } else {
    // Guest User
    authButtons = `
      <li class="nav-item ms-lg-2">
        <a class="nav-link header-menu-link ${normalizedPath === '/login' ? 'active' : ''}" href="#/login">Вход</a>
      </li>
      <li class="nav-item ms-lg-2">
        <a class="nav-link header-menu-link ${normalizedPath === '/register' ? 'active' : ''}" href="#/register">Регистрация</a>
      </li>
      <li class="nav-item ms-lg-3">
         <a class="nav-link header-menu-link d-flex align-items-center gap-1 ${isCreatePropertyActive ? 'active' : ''}" href="#/create-property">
          <i class="bi bi-plus-lg me-1"></i>Добави обява
        </a>
      </li>
    `;
  }

  return `
    <header class="site-header bg-white border-bottom shadow-sm sticky-top" style="z-index: 1030;">
      <nav class="site-navbar navbar navbar-expand-lg navbar-light container py-2">
        <a class="navbar-brand fw-bold text-primary fs-3 d-flex align-items-center gap-2" href="#/">
          <i class="bi bi-house-door-fill"></i>
          PropertyMarket
        </a>
        
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="site-navbar-collapse collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${navLinks}
          </ul>
          
          <ul class="navbar-nav ms-auto align-items-lg-center">
            ${authButtons}
          </ul>
        </div>
      </nav>
    </header>
  `;
}
