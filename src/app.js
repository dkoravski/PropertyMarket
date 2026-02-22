import { createHeader } from './components/header/header.js';
import { createFooter } from './components/footer/footer.js';
import { initRouter } from './router/router.js';
import { render } from './utils/render/render.js';
import { supabase } from './services/supabaseClient/supabaseClient.js';

export function initApp() {
  const appRoot = document.getElementById('app');

  if (!appRoot) {
    throw new Error('Основният контейнер на приложението не е намерен.');
  }

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
      window.location.hash = '#/login';
      window.location.reload();
    }
  };

  const syncHeaderHeightVar = () => {
    const header = document.querySelector('.site-header');
    const fallback = 88;
    const headerHeight = header?.offsetHeight || fallback;
    document.documentElement.style.setProperty('--pm-header-height', `${headerHeight}px`);
  };

  window.addEventListener('resize', syncHeaderHeightVar);

  // Keep auth redirects reliable across both implicit and PKCE flows.
  // Some links contain hash tokens (#access_token=...), others contain query params (?code=... or token_hash=...).
  // We normalize this before the router renders any page.
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      window.location.hash = '#/reset-password';
    }
  });

  completeSupabaseAuthRedirect()
    .catch((err) => {
      console.error('Supabase redirect processing error:', err);
    })
    .finally(() => {
      initRouter(({ path, pageContent }) => {
        const isHomePage = path.split('?')[0] === '/';
        render(
          appRoot,
          `${createHeader(path)}
      <main class="${isHomePage ? 'p-0' : 'container py-4'}">${pageContent}</main>
      ${createFooter()}`
        );

        syncHeaderHeightVar();
      });
    });
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

  let tokenFragment = '';
  if (rawHash.startsWith('#access_token=')) {
    tokenFragment = rawHash.slice(1);
  } else {
    const nestedTokenIndex = rawHash.indexOf('#access_token=');
    if (nestedTokenIndex !== -1) {
      tokenFragment = rawHash.slice(nestedTokenIndex + 1);
    }
  }

  if (!tokenFragment) {
    return false;
  }

  const hashParams = new URLSearchParams(tokenFragment);
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
    window.location.hash = '#/reset-password';
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
