# PropertyMarket

PropertyMarket is a multi-page web application for buying, selling and renting residential properties (apartments, houses, villas, guest houses, etc.) built withJavaScript and Supabase. 
The platform allows users to:
- register and authenticate using email and password;
- create, edit and delete property listings;
- save their favorite properties to a wishlist;
- manage their profile information;
- access admin features (for admin users only) to manage users and property listings.
Site visitors (including non-authenticated users) can view and browse all published property listings.

## Architecture and Tech Stack

Classical client-server app:
- Front-end: JavaScript application, HTML, CSS, Bootstrap;
- Back-end: Supabase (PostgreSQL database);
- Authentication: Supabase Auth;
- Build tools: Vite, npm;
- API: Supabase REST API;
- Hosting: Netlify;
- Source code: GitHub.

## Modular design

- Use a modular code structure with separate files and folders for different components, pages, services, utils, etc.;
- Use ES6+ features and follow best practices for JavaScript development.


## UI Guidelines

- Use HTML, CSS, Bootstrap and vanilla JavaScript for the front-end development;
- Use Bootstrap components and utilities to create a responsive and user-friendly interface;
- implement a clean, modern and responsive design with semantic HTML and CSS;
- Use consistent styling across pages;
- Use form validation for all user inputs.
- Use appropriate icons, effects and visual cues to enhance usability;
- Provide loading and error states for async operations.

## Pages and navigation

- Implement a multi-page application with separate files for each screen.
- Required pages include:
  - Home / Listings
  - Property Details
  - Register
  - Login- Create Property
  - Edit Property
  - Profile
  - Favorites
  - Admin Panel.
- Use reusable UI components (html, css, js) where possible ;
- Use URL-based navigation for each page (e.g., /home, /listings, /property/:id, /profile, /admin, etc.).

## Back-end and Database

- Use Supabase as the backend service for the app.
- Use PostgreSQL as the database with tables for users, properties, favorites, property images, etc.;
- Use Supabase Storage for storing property images;
- When changing the database schema, always use migrations to keep track of changes;
- After applying a migration in Supabase, keep a copy of the migration sql file in the code.

## Authentication and Authorization

- Use Supabase Auth for user registration and authentication;
- Implement RLS (Row Level Security) policies in Supabase to restrict access to data based on user roles and permissions;
- Implement user roles in the `profiles` table (role: 'user' or 'admin') to manage permissions and access control.

### Public Access
- Unauthenticated users can view all property listings and details;
- Property listings are publicly readable.

### Restricted Access

- Only authenticated users can create, edit and delete their own properties;
- Only authenticated users can add favorites to their wishlist;
- Admin users have full access to all properties.