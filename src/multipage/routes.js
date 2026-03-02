const CLEAN_PAGE_URLS = {
  home: '/home',
  about: '/about',
  contacts: '/contacts',
  listings: '/listings',
  propertyDetails: '/property',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  createProperty: '/create-property',
  editProperty: '/edit-property',
  profile: '/profile',
  myListings: '/my-listings',
  favorites: '/favorites',
  admin: '/admin',
};

export const LOGICAL_PATHS = {
  home: '/',
  about: '/about',
  contacts: '/contacts',
  listings: '/listings',
  propertyDetails: '/property',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  createProperty: '/create-property',
  editProperty: '/edit-property',
  profile: '/profile',
  myListings: '/my-listings',
  favorites: '/favorites',
  admin: '/admin',
};

const LEGACY_PAGE_URLS = {
  home: '/src/pages/homePage/homePage.html',
  about: '/src/pages/aboutPage/aboutPage.html',
  contacts: '/src/pages/aboutPage/contactsPage.html',
  listings: '/src/pages/listingsPage/listingsPage.html',
  propertyDetails: '/src/pages/propertyDetailsPage/propertyDetailsPage.html',
  login: '/src/pages/loginPage/loginPage.html',
  register: '/src/pages/registerPage/registerPage.html',
  forgotPassword: '/src/pages/forgotPasswordPage/forgotPasswordPage.html',
  resetPassword: '/src/pages/resetPasswordPage/resetPasswordPage.html',
  createProperty: '/src/pages/createPropertyPage/createPropertyPage.html',
  editProperty: '/src/pages/editPropertyPage/editPropertyPage.html',
  profile: '/src/pages/profilePage/profilePage.html',
  myListings: '/src/pages/myListingsPage/myListingsPage.html',
  favorites: '/src/pages/favoritesPage/favoritesPage.html',
  admin: '/src/pages/adminPage/adminPage.html',
};

export const PAGE_URLS = CLEAN_PAGE_URLS;

export function getLogicalPathFromUrl(pathname = window.location.pathname) {
  if (pathname === '/' || pathname.endsWith('/index.html')) {
    return LOGICAL_PATHS.home;
  }

  const normalizedPathname = pathname.replace(/\/$/, '') || '/';

  const cleanEntries = Object.entries(CLEAN_PAGE_URLS);
  for (const [key, url] of cleanEntries) {
    if (normalizedPathname === url) {
      return LOGICAL_PATHS[key] || LOGICAL_PATHS.home;
    }
  }

  const legacyEntries = Object.entries(LEGACY_PAGE_URLS);
  for (const [key, url] of legacyEntries) {
    if (normalizedPathname === url) {
      return LOGICAL_PATHS[key] || LOGICAL_PATHS.home;
    }
  }

  return LOGICAL_PATHS.home;
}
