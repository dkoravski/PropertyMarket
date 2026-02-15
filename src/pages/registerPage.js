export function createRegisterPage() {
  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-4">Регистрация</h1>
      <form class="row g-3" novalidate>
        <div class="col-12">
          <label for="register-email" class="form-label">Имейл</label>
          <input id="register-email" type="email" class="form-control" placeholder="Въведете имейл" />
        </div>
        <div class="col-12">
          <label for="register-password" class="form-label">Парола</label>
          <input id="register-password" type="password" class="form-control" placeholder="Създайте парола" />
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-primary">Създай профил</button>
        </div>
      </form>
    </section>
  `;
}
