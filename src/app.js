import { createHeader } from './components/header/header.js';
import { createFooter } from './components/footer/footer.js';
import { initRouter } from './router/router.js';
import { render } from './utils/render/render.js';

export function initApp() {
  const appRoot = document.getElementById('app');

  if (!appRoot) {
    throw new Error('Основният контейнер на приложението не е намерен.');
  }

  initRouter(({ path, pageContent }) => {
    render(
      appRoot,
      `${createHeader(path)}
      <main class="container py-4">${pageContent}</main>
      ${createFooter()}`
    );
  });
}
