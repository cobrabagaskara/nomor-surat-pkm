// Toast system module
export function showToast(text, type = 'info') {
  const toast = document.getElementById("toast");
  if (!toast) return;
  
  toast.textContent = text;
  toast.style.background = 
    type === 'error' ? 'var(--danger-color)' :
    type === 'success' ? 'var(--secondary-color)' :
    type === 'warning' ? 'var(--warning-color)' :
    'var(--gray-900)';
  
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
