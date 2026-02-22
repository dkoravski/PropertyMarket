export function createFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="site-footer site-footer-surface border-top mt-5">
      <div class="site-footer-inner container py-3 text-center small">
        © ${currentYear} PropertyMarket. Всички права запазени.
      </div>
    </footer>
  `;
}
