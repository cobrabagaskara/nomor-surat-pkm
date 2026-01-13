// Toast system module dengan icon
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
  
  // Auto hide setelah 2.5 detik (kecuali untuk error)
  const duration = type === 'error' ? 4000 : 2500;
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
  
  // Tambahkan class untuk animasi pulse untuk notifikasi penting
  if (type === 'success') {
    toast.classList.add("important");
    setTimeout(() => {
      toast.classList.remove("important");
    }, 1000);
  }
}
