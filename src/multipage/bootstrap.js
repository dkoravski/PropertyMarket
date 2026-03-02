import { initPage } from './initPage.js';
import { LOGICAL_PATHS } from './routes.js';

import { createHomePage } from '../pages/homePage/homePage.js';
import { createAboutPage } from '../pages/aboutPage/aboutPage.js';
import { createContactsPage } from '../pages/aboutPage/contactsPage.js';
import { createListingsPage } from '../pages/listingsPage/listingsPage.js';
import { createPropertyDetailsPage } from '../pages/propertyDetailsPage/propertyDetailsPage.js';
import { createLoginPage } from '../pages/loginPage/loginPage.js';
import { createRegisterPage } from '../pages/registerPage/registerPage.js';
import { createForgotPasswordPage } from '../pages/forgotPasswordPage/forgotPasswordPage.js';
import { createResetPasswordPage } from '../pages/resetPasswordPage/resetPasswordPage.js';
import { createPropertyPage } from '../pages/createPropertyPage/createPropertyPage.js';
import { createEditPropertyPage } from '../pages/editPropertyPage/editPropertyPage.js';
import { createProfilePage } from '../pages/profilePage/profilePage.js';
import { createMyListingsPage } from '../pages/myListingsPage/myListingsPage.js';
import { createFavoritesPage } from '../pages/favoritesPage/favoritesPage.js';
import { createAdminPage } from '../pages/adminPage/adminPage.js';

const query = new URLSearchParams(window.location.search);
const page = document.body.dataset.page || 'home';

const configs = {
  home: {
    pageFactory: createHomePage,
    logicalPath: LOGICAL_PATHS.home,
    isHome: true,
  },
  about: {
    pageFactory: createAboutPage,
    logicalPath: LOGICAL_PATHS.about,
  },
  contacts: {
    pageFactory: createContactsPage,
    logicalPath: LOGICAL_PATHS.contacts,
  },
  listings: {
    pageFactory: () => {
      const categoryParam = query.get('category');
      const initialCategory = categoryParam === 'sale'
        ? 'Продажби'
        : categoryParam === 'rent'
          ? 'Наеми'
          : 'Всички обяви';

      return createListingsPage(initialCategory);
    },
    logicalPath: LOGICAL_PATHS.listings,
  },
  propertyDetails: {
    pageFactory: () => createPropertyDetailsPage(query.get('id') || ''),
    logicalPath: LOGICAL_PATHS.propertyDetails,
  },
  login: {
    pageFactory: createLoginPage,
    logicalPath: LOGICAL_PATHS.login,
  },
  register: {
    pageFactory: createRegisterPage,
    logicalPath: LOGICAL_PATHS.register,
  },
  forgotPassword: {
    pageFactory: createForgotPasswordPage,
    logicalPath: LOGICAL_PATHS.forgotPassword,
  },
  resetPassword: {
    pageFactory: createResetPasswordPage,
    logicalPath: LOGICAL_PATHS.resetPassword,
  },
  createProperty: {
    pageFactory: createPropertyPage,
    logicalPath: LOGICAL_PATHS.createProperty,
    requiresAuth: true,
  },
  editProperty: {
    pageFactory: () => createEditPropertyPage(query.get('id') || ''),
    logicalPath: LOGICAL_PATHS.editProperty,
    requiresAuth: true,
  },
  profile: {
    pageFactory: createProfilePage,
    logicalPath: LOGICAL_PATHS.profile,
    requiresAuth: true,
  },
  myListings: {
    pageFactory: createMyListingsPage,
    logicalPath: LOGICAL_PATHS.myListings,
    requiresAuth: true,
  },
  favorites: {
    pageFactory: createFavoritesPage,
    logicalPath: LOGICAL_PATHS.favorites,
    requiresAuth: true,
  },
  admin: {
    pageFactory: createAdminPage,
    logicalPath: LOGICAL_PATHS.admin,
    requiresAdmin: true,
  },
};

const selectedConfig = configs[page] || configs.home;

initPage(selectedConfig);
