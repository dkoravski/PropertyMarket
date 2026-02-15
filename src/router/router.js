import { createHomePage } from '../pages/homePage/homePage.js';
import { createAboutPage } from '../pages/aboutPage/aboutPage.js';
import { createListingsPage } from '../pages/listingsPage/listingsPage.js';
import { createPropertyDetailsPage } from '../pages/propertyDetailsPage/propertyDetailsPage.js';
import { createLoginPage } from '../pages/loginPage/loginPage.js';
import { createRegisterPage } from '../pages/registerPage/registerPage.js';
import { createPropertyPage } from '../pages/createPropertyPage/createPropertyPage.js';
import { createEditPropertyPage } from '../pages/editPropertyPage/editPropertyPage.js';
import { createProfilePage } from '../pages/profilePage/profilePage.js';
import { createFavoritesPage } from '../pages/favoritesPage/favoritesPage.js';
import { createAdminPage } from '../pages/adminPage/adminPage.js';

const routes = {
  '/': { pageFactory: createHomePage },
  '/about': { pageFactory: createAboutPage },
  '/listings': { pageFactory: createListingsPage },
  '/property': { pageFactory: createPropertyDetailsPage },
  '/login': { pageFactory: createLoginPage },
  '/register': { pageFactory: createRegisterPage },
  '/create-property': { pageFactory: createPropertyPage, requiresAuth: true },
  '/edit-property': { pageFactory: createEditPropertyPage, requiresAuth: true },
  '/profile': { pageFactory: createProfilePage, requiresAuth: true },
  '/favorites': { pageFactory: createFavoritesPage, requiresAuth: true },
  '/admin': { pageFactory: createAdminPage, requiresAdmin: true },
};

export function initRouter(onRouteChange, options = {}) {
  const getAuthState = options.getAuthState || getAuthStateFromStorage;

  const renderCurrentRoute = () => {
    const path = getCurrentPath();
    const route = routes[path];
    const authState = normalizeAuthState(getAuthState());

    if (!route) {
      onRouteChange({
        path,
        pageContent: createNotFoundPage(),
      });
      return;
    }

    if (route.requiresAdmin && authState.role !== 'admin') {
      onRouteChange({
        path,
        pageContent: createAdminOnlyPage(),
      });
      return;
    }

    if (route.requiresAuth && !authState.isAuthenticated) {
      onRouteChange({
        path,
        pageContent: createAuthRequiredPage(),
      });
      return;
    }

    onRouteChange({
      path,
      pageContent: route.pageFactory(),
    });
  };

  window.addEventListener('hashchange', renderCurrentRoute);
  renderCurrentRoute();
}

function getCurrentPath() {
  return window.location.hash.replace('#', '') || '/';
}

function getAuthStateFromStorage() {
  const isAuthenticated = localStorage.getItem('pm_is_authenticated') === 'true';
  const roleFromStorage = localStorage.getItem('pm_user_role');

  return {
    isAuthenticated,
    role: roleFromStorage,
  };
}

function normalizeAuthState(authState) {
  if (!authState) {
    return { isAuthenticated: false, role: 'guest' };
  }

  const isAuthenticated = Boolean(authState.isAuthenticated);
  const role = (authState.role || (isAuthenticated ? 'user' : 'guest')).toLowerCase();

  return { isAuthenticated, role };
}

function createNotFoundPage() {
  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Страницата не е намерена</h1>
      <p class="mb-3 text-secondary">Моля, върнете се към началната страница.</p>
      <a href="#/" class="btn btn-primary">Към начало</a>
    </section>
  `;
}

function createAuthRequiredPage() {
  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Необходим е вход</h1>
      <p class="mb-3 text-secondary">За да достъпите тази страница, моля влезте в профила си.</p>
      <div class="d-flex gap-2 flex-wrap">
        <a href="#/login" class="btn btn-primary">Към вход</a>
        <a href="#/register" class="btn btn-outline-primary">Към регистрация</a>
      </div>
    </section>
  `;
}

function createAdminOnlyPage() {
  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Достъпът е ограничен</h1>
      <p class="mb-3 text-secondary">Тази страница е достъпна само за администратори.</p>
      <a href="#/" class="btn btn-primary">Към начало</a>
    </section>
  `;
}
