// Utility functions
import { showToast } from '../app.js';

// Format tanggal dan waktu
export function formatTime(timestamp) {
  if (!timestamp) return "Waktu tidak tersedia";
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // Cek jika tanggal valid
    if (isNaN(date.getTime())) {
      return "Waktu tidak valid";
    }
    
    const timeStr = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const dateStr = date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    return { timeStr, dateStr, fullDate: date };
  } catch (error) {
    console.error("Error formatting time:", error);
    return { timeStr: "Error", dateStr: "", fullDate: new Date() };
  }
}

// Format nomor surat
export function formatNomor(counter, type, bulan, tahun) {
  const no = String(counter).padStart(5, "0");
  return `400.7/${no}/${type}/PKM.KDG/${bulan}/${tahun}`;
}

// Validasi input
export function validateInputs(ruang, bulan, tahun) {
  const errors = [];
  
  if (!ruang.trim()) errors.push("Pilih ruang terlebih dahulu");
  if (!bulan.trim()) errors.push("Bulan harus diisi");
  if (!tahun.trim()) errors.push("Tahun harus diisi");
  if (isNaN(tahun)) errors.push("Tahun harus berupa angka");
  
  return errors;
}

// Get bulan Romawi otomatis
export function getCurrentBulanTahun() {
  const bulanRomawi = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
  const now = new Date();
  
  return {
    bulan: bulanRomawi[now.getMonth()],
    tahun: now.getFullYear().toString()
  };
}

// Copy to clipboard dengan feedback
export async function copyToClipboard(text) {
  if (!text) {
    showToast("Tidak ada teks untuk disalin", 'error');
    return false;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    showToast("✓ Nomor disalin", 'success');
    return true;
  } catch (error) {
    console.error("Copy failed:", error);
    showToast("Gagal menyalin", 'error');
    return false;
  }
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Parse nomor dari string
export function parseNomorFromString(nomorString) {
  try {
    const parts = nomorString.split('/');
    if (parts.length >= 6) {
      return {
        prefix: parts[0],
        counter: parseInt(parts[1]),
        type: parts[2],
        unit: parts[3],
        bulan: parts[4],
        tahun: parts[5]
      };
    }
  } catch (error) {
    console.error("Error parsing nomor:", error);
  }
  return null;
}

// Generate unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format angka dengan pemisah ribuan
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
