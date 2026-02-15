import { createHeader } from './components/header/header.js';
import { createFooter } from './components/footer/footer.js';
import { createHomePage } from './pages/homePage/homePage.js';
import { createListingsPage } from './pages/listingsPage/listingsPage.js';
import { createPropertyDetailsPage } from './pages/propertyDetailsPage/propertyDetailsPage.js';
import { createLoginPage } from './pages/loginPage/loginPage.js';
import { createRegisterPage } from './pages/registerPage/registerPage.js';
import { createPropertyPage } from './pages/createPropertyPage/createPropertyPage.js';
import { createEditPropertyPage } from './pages/editPropertyPage/editPropertyPage.js';
import { createProfilePage } from './pages/profilePage/profilePage.js';
import { createFavoritesPage } from './pages/favoritesPage/favoritesPage.js';
import { createAdminPage } from './pages/adminPage/adminPage.js';
import { render } from './utils/render/render.js';

const routes = {
  '/': createHomePage,
  '/listings': createListingsPage,
  '/property': createPropertyDetailsPage,
  '/login': createLoginPage,
  '/register': createRegisterPage,
  '/create-property': createPropertyPage,
  '/edit-property': createEditPropertyPage,
  '/profile': createProfilePage,
  '/favorites': createFavoritesPage,
  '/admin': createAdminPage,
};

export function initApp() {
  const appRoot = document.getElementById('app');

  if (!appRoot) {
    throw new Error('Основният контейнер на приложението не е намерен.');
  }

  const renderCurrentRoute = () => {
    const path = window.location.hash.replace('#', '') || '/';
    const pageFactory = routes[path] || createNotFoundPage;

    render(
      appRoot,
      `${createHeader(path)}
      <main class="container py-4">${pageFactory()}</main>
      ${createFooter()}`
    );
  };

  window.addEventListener('hashchange', renderCurrentRoute);
  renderCurrentRoute();
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
