export function showPageFeedback(type, message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show fixed-top m-3 shadow`;
  alertDiv.style.zIndex = '1050';
  alertDiv.innerHTML = `
    <strong>${type === 'success' ? 'Успешно!' : 'Грешка!'}</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
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
