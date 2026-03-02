import { PAGE_URLS } from './routes.js';

const HASH_HANDLER_FLAG = 'pmHashRouteHandlerAttached';

function buildUrlWithSearch(baseUrl, search) {
  if (!search) return baseUrl;
  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${search}`;
}

export function convertHashRouteToUrl(hashRoute) {
  const raw = (hashRoute || '').trim();
  if (!raw.startsWith('#/')) {
    return raw || PAGE_URLS.home;
  }

  const hashPath = raw.slice(1);
  const queryIndex = hashPath.indexOf('?');
  const routePath = queryIndex === -1 ? hashPath : hashPath.slice(0, queryIndex);
  const routeSearch = queryIndex === -1 ? '' : hashPath.slice(queryIndex + 1);

  if (routePath.startsWith('/property/')) {
    const id = routePath.split('/')[2];
    return buildUrlWithSearch(PAGE_URLS.propertyDetails, `id=${encodeURIComponent(id)}${routeSearch ? `&${routeSearch}` : ''}`);
  }

  if (routePath.startsWith('/edit-property/')) {
    const id = routePath.split('/')[2];
    return buildUrlWithSearch(PAGE_URLS.editProperty, `id=${encodeURIComponent(id)}${routeSearch ? `&${routeSearch}` : ''}`);
  }

  const staticRouteMap = {
    '/': PAGE_URLS.home,
    '/about': PAGE_URLS.about,
    '/contacts': PAGE_URLS.contacts,
    '/listings': PAGE_URLS.listings,
    '/listings-sales': `${PAGE_URLS.listings}?category=sale`,
    '/listings-rent': `${PAGE_URLS.listings}?category=rent`,
    '/login': PAGE_URLS.login,
    '/register': PAGE_URLS.register,
    '/forgot-password': PAGE_URLS.forgotPassword,
    '/reset-password': PAGE_URLS.resetPassword,
    '/create-property': PAGE_URLS.createProperty,
    '/edit-property': PAGE_URLS.editProperty,
    '/profile': PAGE_URLS.profile,
    '/my-listings': PAGE_URLS.myListings,
    '/favorites': PAGE_URLS.favorites,
    '/admin': PAGE_URLS.admin,
  };

  const staticTarget = staticRouteMap[routePath] || PAGE_URLS.home;
  return buildUrlWithSearch(staticTarget, routeSearch);
}

export function rewriteHashLinks(rootElement = document) {
  const links = rootElement.querySelectorAll('a[href^="#/"]');
  links.forEach((link) => {
    const nextHref = convertHashRouteToUrl(link.getAttribute('href'));
    if (nextHref) {
      link.setAttribute('href', nextHref);
    }
  });
}

export function navigateToHashRoute(hashRoute) {
  window.location.href = convertHashRouteToUrl(hashRoute);
}

export function redirectIfHashRoutePresent() {
  const hash = window.location.hash || '';
  if (!hash.startsWith('#/')) {
    return false;
  }

  const targetUrl = convertHashRouteToUrl(hash);
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (!targetUrl || targetUrl === currentUrl) {
    return false;
  }

  window.location.replace(targetUrl);
  return true;
}

export function installHashRouteClickHandler(rootElement = document) {
  if (rootElement[HASH_HANDLER_FLAG]) {
    return;
  }

  rootElement.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#/"]');
    if (!link) {
      return;
    }

    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const target = link.getAttribute('target');
    if (target && target.toLowerCase() === '_blank') {
      return;
    }

    event.preventDefault();
    navigateToHashRoute(link.getAttribute('href') || '#/');
  });

  rootElement[HASH_HANDLER_FLAG] = true;
}
