export function showPageFeedback(type, message) {
  const containerId = 'pm-toast-container';
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'toast-container position-fixed end-0 p-3';
    container.style.zIndex = '1090';
    container.style.top = 'calc(var(--pm-header-height, 72px) + 0.25rem)';
    document.body.appendChild(container);
  }

  container.querySelectorAll('.toast').forEach((el) => {
    // @ts-ignore
    const instance = bootstrap.Toast.getInstance(el);
    if (instance) instance.hide();
  });

  const toast = document.createElement('div');
  const isSuccess = type === 'success';
  const isInfo = type === 'info';

  toast.className = `toast border-0 shadow-lg rounded-4 bg-${isSuccess ? 'success-subtle' : (isInfo ? 'info-subtle' : 'danger-subtle')}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
    <div class="toast-body px-3 py-2">
      ${message}
    </div>
  `;

  container.appendChild(toast);
  // @ts-ignore
  const toastInstance = bootstrap.Toast.getOrCreateInstance(toast, { delay: 2500, autohide: true });
  toast.addEventListener('hidden.bs.toast', () => toast.remove(), { once: true });
  toastInstance.show();
}

export function showConfirmModal(question) {
  return new Promise((resolve) => {
    // Unique ID
    const modalId = 'confirm-modal-' + Date.now();
    
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h5 class="modal-title fs-5">Потвърждение</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center py-4">
              <p class="mb-0 fs-5">${question}</p>
            </div>
            <div class="modal-footer border-0 justify-content-center pb-4">
              <button type="button" class="btn btn-secondary px-4 me-2" data-bs-dismiss="modal">Отказ</button>
              <button type="button" class="btn btn-danger px-4" id="${modalId}-confirm-btn">Потвърди</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = document.getElementById(modalId);
    // @ts-ignore
    const modal = new bootstrap.Modal(modalElement);
    
    let isConfirmed = false;

    modalElement.addEventListener('hidden.bs.modal', () => {
      modalElement.remove();
      if (!isConfirmed) resolve(false); 
    });

    const confirmBtn = document.getElementById(`${modalId}-confirm-btn`);
    confirmBtn.addEventListener('click', () => {
      isConfirmed = true;
      resolve(true);
      modal.hide();
    });

    modal.show();
  });
}

export function showMessageModal(message, type = 'info') {
  return new Promise((resolve) => {
    // Unique ID
    const modalId = 'message-modal-' + Date.now();
    
    let title = 'Съобщение';
    let btnClass = 'btn-primary';
    
    if (type === 'error' || type === 'danger') {
      title = 'Грешка';
      btnClass = 'btn-danger';
    } else if (type === 'success') {
      title = 'Успех';
      btnClass = 'btn-success';
    } else if (type === 'warning') {
      title = 'Внимание';
      btnClass = 'btn-warning';
    }

    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h5 class="modal-title fs-5">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center py-4">
              <p class="mb-0 fs-5">${message}</p>
            </div>
            <div class="modal-footer border-0 justify-content-center pb-4">
              <button type="button" class="btn ${btnClass} px-4" data-bs-dismiss="modal">Добре</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = document.getElementById(modalId);
    // @ts-ignore
    const modal = new bootstrap.Modal(modalElement);

    modalElement.addEventListener('hidden.bs.modal', () => {
      modalElement.remove();
      resolve();
    });

    modal.show();
  });
}
