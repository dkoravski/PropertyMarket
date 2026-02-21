export function createFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="site-footer border-top bg-white mt-5">
      <div class="site-footer-inner container py-3 text-center text-muted small">
        © ${currentYear} PropertyMarket. Всички права запазени.
      </div>
    </footer>
  `;
}
