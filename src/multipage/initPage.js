import '../styles/main.css';
import { createHeader } from '../components/header/header.js';
import { createFooter } from '../components/footer/footer.js';
import { render } from '../utils/render/render.js';
import { supabase } from '../services/supabaseClient/supabaseClient.js';
import { LOGICAL_PATHS, PAGE_URLS, getLogicalPathFromUrl } from './routes.js';
import { rewriteHashLinks, navigateToHashRoute, installHashRouteClickHandler, redirectIfHashRoutePresent } from './hashCompat.js';

export async function initPage({
  pageFactory,
  pageArgs = [],
  logicalPath,
  requiresAuth = false,
  requiresAdmin = false,
  isHome = false,
}) {
  const appRoot = document.getElementById('app');

  if (!appRoot) {
    throw new Error('Основният контейнер на приложението не е намерен.');
  }

  if (redirectIfHashRoutePresent()) {
    return;
  }

  window.pmNavigateToHashRoute = navigateToHashRoute;
  installHashRouteClickHandler(document);
  window.pmLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('pm_is_authenticated');
      localStorage.removeItem('pm_user_role');
      localStorage.removeItem('pm_user_name');
      localStorage.removeItem('pm_user_email');
      sessionStorage.removeItem('pm_back_dest');
      sessionStorage.removeItem('pm_admin_tab');
      sessionStorage.removeItem('pm_hero_search');
      sessionStorage.setItem('pm_logout_success', 'true');
      window.location.href = PAGE_URLS.home;
    }
  };

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      window.location.href = PAGE_URLS.resetPassword;
    }
  });

  await completeSupabaseAuthRedirect();

  const authState = normalizeAuthState(getAuthStateFromStorage());
  const currentLogicalPath = logicalPath || getLogicalPathFromUrl();

  if (requiresAdmin && authState.role !== 'admin') {
    renderShell(appRoot, currentLogicalPath, createAdminOnlyPage(), isHome);
    rewriteHashLinks(appRoot);
    return;
  }

  if (requiresAuth && !authState.isAuthenticated) {
    renderShell(appRoot, currentLogicalPath, createAuthRequiredPage(), isHome);
    rewriteHashLinks(appRoot);
    return;
  }

  const pageContent = pageFactory(...pageArgs);
  renderShell(appRoot, currentLogicalPath, pageContent, isHome);
  rewriteHashLinks(appRoot);
}

function renderShell(appRoot, logicalPath, pageContent, isHome) {
  render(
    appRoot,
    `${createHeader(logicalPath)}
    <main class="${isHome ? 'p-0' : 'container py-4'}">${pageContent}</main>
    ${createFooter()}`
  );

  syncHeaderHeightVar();
  window.addEventListener('resize', syncHeaderHeightVar);
}

function syncHeaderHeightVar() {
  const header = document.querySelector('.site-header');
  const fallback = 88;
  const headerHeight = header?.offsetHeight || fallback;
  document.documentElement.style.setProperty('--pm-header-height', `${headerHeight}px`);
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

async function completeSupabaseAuthRedirect() {
  const accessSessionFromHash = await setSessionFromHashTokens();
  if (accessSessionFromHash) {
    return;
  }

  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    cleanAuthQueryParams(url);
    return;
  }

  if (tokenHash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: tokenHash,
    });
    if (error) throw error;
    cleanAuthQueryParams(url);
  }
}

async function setSessionFromHashTokens() {
  const rawHash = window.location.hash || '';

  if (!rawHash.startsWith('#access_token=')) {
    return false;
  }

  const hashParams = new URLSearchParams(rawHash.slice(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const type = hashParams.get('type');

  if (!accessToken || !refreshToken) {
    return false;
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  if (type === 'recovery') {
    window.location.href = PAGE_URLS.resetPassword;
  }

  return true;
}

function cleanAuthQueryParams(url) {
  url.searchParams.delete('code');
  url.searchParams.delete('token_hash');
  url.searchParams.delete('type');
  url.searchParams.delete('next');

  const cleaned = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, '', cleaned);
}

function createAuthRequiredPage() {
  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Необходим е вход</h1>
      <p class="mb-3 text-secondary">За да достъпите тази страница, моля влезте в профила си.</p>
      <div class="d-flex gap-2 flex-wrap">
        <a href="${PAGE_URLS.login}" class="btn btn-primary">Към вход</a>
        <a href="${PAGE_URLS.register}" class="btn btn-outline-primary">Към регистрация</a>
      </div>
    </section>
  `;
}

function createAdminOnlyPage() {
  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-3">Достъпът е ограничен</h1>
      <p class="mb-3 text-secondary">Тази страница е достъпна само за администратори.</p>
      <a href="${PAGE_URLS.home}" class="btn btn-primary">Към начало</a>
    </section>
  `;
}
