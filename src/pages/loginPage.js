export function createLoginPage() {
  return `
    <section class="rounded-4 p-4 p-md-5 bg-light border">
      <h1 class="h3 fw-bold mb-4">Вход</h1>
      <form class="row g-3" novalidate>
        <div class="col-12">
          <label for="email" class="form-label">Имейл</label>
          <input id="email" type="email" class="form-control" placeholder="Въведете имейл" />
        </div>
        <div class="col-12">
          <label for="password" class="form-label">Парола</label>
          <input id="password" type="password" class="form-control" placeholder="Въведете парола" />
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-primary">Влез</button>
        </div>
      </form>
    </section>
  `;
}
