import { defineConfig } from 'vite';
import { resolve } from 'path';

const cleanRouteToHtml = {
  '/home': '/src/pages/homePage/homePage.html',
  '/about': '/src/pages/aboutPage/aboutPage.html',
  '/contacts': '/src/pages/aboutPage/contactsPage.html',
  '/listings': '/src/pages/listingsPage/listingsPage.html',
  '/property': '/src/pages/propertyDetailsPage/propertyDetailsPage.html',
  '/login': '/src/pages/loginPage/loginPage.html',
  '/register': '/src/pages/registerPage/registerPage.html',
  '/forgot-password': '/src/pages/forgotPasswordPage/forgotPasswordPage.html',
  '/reset-password': '/src/pages/resetPasswordPage/resetPasswordPage.html',
  '/create-property': '/src/pages/createPropertyPage/createPropertyPage.html',
  '/edit-property': '/src/pages/editPropertyPage/editPropertyPage.html',
  '/profile': '/src/pages/profilePage/profilePage.html',
  '/my-listings': '/src/pages/myListingsPage/myListingsPage.html',
  '/favorites': '/src/pages/favoritesPage/favoritesPage.html',
  '/admin': '/src/pages/adminPage/adminPage.html',
};

const extraDevRewrites = {
  '/multipage/bootstrap.js': '/src/multipage/bootstrap.js',
};

function installCleanRouteRewrites(server) {
  server.middlewares.use((req, _res, next) => {
    if (req.method !== 'GET' || !req.url) {
      next();
      return;
    }

    const [pathname, query = ''] = req.url.split('?');
    const rewriteTarget = cleanRouteToHtml[pathname] || extraDevRewrites[pathname];

    if (!rewriteTarget) {
      next();
      return;
    }

    req.url = query ? `${rewriteTarget}?${query}` : rewriteTarget;
    next();
  });
}

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  plugins: [
    {
      name: 'propertymarket-clean-route-rewrites',
      configureServer(server) {
        installCleanRouteRewrites(server);
      },
      configurePreviewServer(server) {
        installCleanRouteRewrites(server);
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'src/pages/homePage/homePage.html'),
        about: resolve(__dirname, 'src/pages/aboutPage/aboutPage.html'),
        contacts: resolve(__dirname, 'src/pages/aboutPage/contactsPage.html'),
        listings: resolve(__dirname, 'src/pages/listingsPage/listingsPage.html'),
        propertyDetails: resolve(__dirname, 'src/pages/propertyDetailsPage/propertyDetailsPage.html'),
        login: resolve(__dirname, 'src/pages/loginPage/loginPage.html'),
        register: resolve(__dirname, 'src/pages/registerPage/registerPage.html'),
        forgotPassword: resolve(__dirname, 'src/pages/forgotPasswordPage/forgotPasswordPage.html'),
        resetPassword: resolve(__dirname, 'src/pages/resetPasswordPage/resetPasswordPage.html'),
        createProperty: resolve(__dirname, 'src/pages/createPropertyPage/createPropertyPage.html'),
        editProperty: resolve(__dirname, 'src/pages/editPropertyPage/editPropertyPage.html'),
        profile: resolve(__dirname, 'src/pages/profilePage/profilePage.html'),
        myListings: resolve(__dirname, 'src/pages/myListingsPage/myListingsPage.html'),
        favorites: resolve(__dirname, 'src/pages/favoritesPage/favoritesPage.html'),
        admin: resolve(__dirname, 'src/pages/adminPage/adminPage.html'),
      },
    },
  },
});
