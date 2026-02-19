
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

  // Navigation Links (Left side)
  let navLinks = `
    <li class="nav-item">
      <a class="nav-link ${currentPath === '/' ? 'active' : ''}" href="#/">Начало</a>
    </li>
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle ${isListingsActive ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        Обяви
      </a>
      <ul class="dropdown-menu border-0 shadow-sm">
        <li><a class="dropdown-item" href="#/listings">Всички</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#/listings-sales">Продажби</a></li>
        <li><a class="dropdown-item" href="#/listings-rent">Наеми</a></li>
      </ul>
    </li>
    <li class="nav-item">
      <a class="nav-link ${currentPath === '/about' ? 'active' : ''}" href="#/about">За нас</a>
    </li>
  `;

  // Action Buttons (Right side)
  let authButtons = '';

  if (isAuthenticated) {
    // User is logged in
    authButtons = `
      <li class="nav-item me-2">
        <a class="nav-link position-relative ${currentPath === '/favorites' ? 'text-danger' : ''}" href="#/favorites" title="Любими">
          <i class="bi bi-heart${currentPath === '/favorites' ? '-fill' : ''} fs-5"></i>
          <span class="ms-1 d-lg-inline">Любими</span>
        </a>
      </li>
      <li class="nav-item dropdown me-2">
        <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle fs-5"></i>
          <span class="d-none d-lg-inline">Профил</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end border-0 shadow-sm">
          <li><a class="dropdown-item" href="#/profile">Моят Профил</a></li>
          <li><a class="dropdown-item" href="#/my-listings">Моите Обяви</a></li>
          ${isAdmin ? '<li><a class="dropdown-item text-danger" href="#/admin">Админ панел</a></li>' : ''}
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" onclick="localStorage.clear(); window.location.reload();">Изход</a></li>
        </ul>
      </li>
      <li class="nav-item ms-2">
        <a class="btn btn-success fw-semibold shadow-sm" href="#/create-property">
          <i class="bi bi-plus-lg me-1"></i>Добави обява
        </a>
      </li>
    `;
  } else {
    // Guest User
    authButtons = `
      <li class="nav-item ms-lg-2">
        <a class="btn btn-link text-decoration-none text-dark" href="#/login">Вход</a>
      </li>
      <li class="nav-item ms-lg-2">
        <a class="btn btn-primary px-3 shadow-sm" href="#/register">Регистрация</a>
      </li>
      <li class="nav-item ms-lg-3 border-start ps-lg-3">
         <a class="btn btn-outline-success fw-semibold" href="#/create-property">
          <i class="bi bi-plus-lg me-1"></i>Добави обява
        </a>
      </li>
    `;
  }

  return `
    <header class="bg-white border-bottom shadow-sm sticky-top" style="z-index: 1030;">
      <nav class="navbar navbar-expand-lg navbar-light container py-2">
        <a class="navbar-brand fw-bold text-primary fs-3 d-flex align-items-center gap-2" href="#/">
          <i class="bi bi-house-door-fill"></i>
          PropertyMarket
        </a>
        
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">
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
