// Toast system module
export function showToast(text, type = 'info') {
  const toast = document.getElementById("toast");
  if (!toast) return;
  
  // Reset kelas
  toast.className = '';
  toast.classList.add(type);
  
  // Set icon berdasarkan type
  let icon = '';
  switch(type) {
    case 'success':
      icon = '✅';
      break;
    case 'error':
      icon = '❌';
      break;
    case 'warning':
      icon = '⚠️';
      break;
    default:
      icon = 'ℹ️';
  }
  
  // Set konten dengan icon
  toast.innerHTML = `
    <span style="font-size:20px;">${icon}</span>
    <span>${text}</span>
  `;
  
  // Tampilkan toast
  toast.classList.add("show");
  
  // Auto hide
  const duration = type === 'error' ? 4000 : 2500;
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
  
  // Animasi pulse untuk success
  if (type === 'success') {
    toast.classList.add("important");
    setTimeout(() => {
      toast.classList.remove("important");
    }, 1000);
  }
}
