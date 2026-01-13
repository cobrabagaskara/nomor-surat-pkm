// Main Application Logic
import { 
  db, doc, getDoc, setDoc, updateDoc, increment, 
  collection, addDoc, query, orderBy, limit, 
  onSnapshot, serverTimestamp 
} from './firebase-config.js';

import { 
  formatTime, formatNomor, validateInputs, 
  getCurrentBulanTahun, copyToClipboard 
} from './modules/utils.js';

import { showToast } from './modules/toast.js';

// ===== GLOBAL STATE =====
let unsubscribeAll = null;
let allData = { SKB: [], KEUR: [] };
let currentTab = 'SKB';

// ===== DOM ELEMENTS =====
const elements = {
  ruang: () => document.getElementById('ruang'),
  bulan: () => document.getElementById('bulan'),
  tahun: () => document.getElementById('tahun'),
  initSKB: () => document.getElementById('initSKB'),
  initKEUR: () => document.getElementById('initKEUR'),
  skbCount: () => document.getElementById('skbCount'),
  keurCount: () => document.getElementById('keurCount'),
  tableSKB: () => document.getElementById('tableSKB'),
  tableKEUR: () => document.getElementById('tableKEUR'),
  settingsPanel: () => document.getElementById('settingsPanel'),
  toast: () => document.getElementById('toast')
};

// ===== EXPORT FUNCTIONS TO WINDOW =====
window.showToast = showToast;

window.copyText = async (text) => {
  await copyToClipboard(text, showToast);
};

window.switchTab = (type) => {
  currentTab = type;
  
  // Update tab buttons
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  
  // Activate selected tab
  document.querySelector(`.tab[onclick*="${type}"]`).classList.add("active");
  document.getElementById(type).classList.add("active");
  
  // Render table for active tab
  renderTable(type);
};

// ===== DATA LOADING =====
window.loadAllData = () => {
  console.log("🔄 Loading all data...");
  showToast("Memuat data...", 'info');
  
  // Cleanup previous listener
  if (unsubscribeAll) {
    unsubscribeAll();
  }
  
  // Query all data (without where clause to avoid index issues)
  const q = query(
    collection(db, "history"), 
    orderBy("time", "desc"), 
    limit(50)
  );
  
  unsubscribeAll = onSnapshot(q, 
    // Success callback
    (snapshot) => {
      console.log(`📥 Received ${snapshot.docs.length} documents`);
      
      // Reset data
      allData = { SKB: [], KEUR: [] };
      
      // Organize data by type
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const type = data.type || 'UNKNOWN';
        
        if (type === 'SKB' || type === 'KEUR') {
          allData[type].push({
            id: doc.id,
            ...data,
            timestamp: data.time?.toDate ? data.time.toDate() : new Date()
          });
        }
      });
      
      // Update counters in UI
      updateCounters();
      
      // Render current tab
      renderTable(currentTab);
      
      // Show success message if we have data
      if (snapshot.docs.length > 0) {
        showToast(`✓ Data diperbarui (${snapshot.docs.length} dokumen)`, 'success');
      }
    },
    // Error callback
    (error) => {
      console.error("❌ Error loading data:", error);
      showToast(`Error: ${error.message}`, 'error');
      
      // Try fallback without orderBy
      if (error.code === 'failed-precondition') {
        console.log("⚠️  Trying without orderBy...");
        loadWithoutOrderBy();
      }
    }
  );
};

function loadWithoutOrderBy() {
  const q = query(collection(db, "history"), limit(50));
  
  onSnapshot(q, 
    (snapshot) => {
      allData = { SKB: [], KEUR: [] };
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const type = data.type || 'UNKNOWN';
        
        if (type === 'SKB' || type === 'KEUR') {
          allData[type].push({
            id: doc.id,
            ...data,
            timestamp: data.time?.toDate ? data.time.toDate() : new Date()
          });
        }
      });
      
      // Manual sorting
      allData.SKB.sort((a, b) => b.timestamp - a.timestamp);
      allData.KEUR.sort((a, b) => b.timestamp - a.timestamp);
      
      updateCounters();
      renderTable(currentTab);
      showToast("✓ Data dimuat (tanpa sorting)", 'info');
    },
    (error) => {
      console.error("Even without orderBy error:", error);
      showToast("Gagal memuat data", 'error');
    }
  );
}

function updateCounters() {
  const skbCount = elements.skbCount();
  const keurCount = elements.keurCount();
  
  if (skbCount) skbCount.textContent = allData.SKB.length;
  if (keurCount) keurCount.textContent = allData.KEUR.length;
}

// ===== RENDER TABLE =====
function renderTable(type) {
  const tableId = `table${type}`;
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;
  
  const data = allData[type] || [];
  
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-state">
          Belum ada data ${type}.<br>
          <small>Klik tombol "+ ${type}" untuk membuat nomor pertama</small>
        </td>
      </tr>
    `;
    return;
  }
  
  let html = '';
  data.slice(0, 15).forEach(item => {
    const { timeStr, dateStr } = formatTime(item.timestamp);
    
    html += `
      <tr>
        <td class="copy" onclick="copyText('${item.nomor}')" title="Klik untuk menyalin">
          <div style="font-weight:500;">${item.nomor}</div>
          <div style="font-size:12px;color:var(--gray-500);margin-top:2px;">
            📋 Klik untuk menyalin
          </div>
        </td>
        <td>
          <span class="ruang-badge">
            ${item.ruang || '-'}
          </span>
        </td>
        <td>
          <div>${timeStr}</div>
          <div style="font-size:12px;color:var(--gray-500);">${dateStr}</div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

// ===== GENERATE NUMBER =====
window.generateNumber = async (type) => {
  const ruang = elements.ruang().value.trim();
  const bulan = elements.bulan().value.trim();
  const tahun = elements.tahun().value.trim();
  
  // Validate inputs
  const errors = validateInputs(ruang, bulan, tahun);
  if (errors.length > 0) {
    errors.forEach(error => showToast(error, 'error'));
    return;
  }
  
  try {
    showToast(`Membuat nomor ${type}...`, 'info');
    
    // Get current counter
    const counterRef = doc(db, "counters", type);
    const counterSnap = await getDoc(counterRef);
    
    let nextNumber = 1;
    if (counterSnap.exists()) {
      nextNumber = (counterSnap.data().value || 0) + 1;
    }
    
    // Format nomor
    const nomor = formatNomor(nextNumber, type, bulan, tahun);
    
    // Save to history (immediate feedback)
    await addDoc(collection(db, "history"), {
      type, 
      ruang, 
      nomor, 
      time: serverTimestamp(),
      bulan,
      tahun,
      counter: nextNumber
    });
    
    // Update counter (background process)
    await setDoc(counterRef, { 
      value: nextNumber,
      updatedAt: serverTimestamp() 
    }, { merge: true });
    
    // Success
    showToast(`✓ ${type} dibuat: ${nextNumber.toString().padStart(5, "0")}`, 'success');
    await copyToClipboard(nomor, showToast);
    
  } catch (error) {
    console.error("❌ Error generating number:", error);
    showToast(`Gagal: ${error.message}`, 'error');
  }
};

// ===== SET INITIAL COUNTER =====
window.setInitial = async (type) => {
  const inputId = type === "SKB" ? "initSKB" : "initKEUR";
  const input = document.getElementById(inputId);
  const val = input.value.trim();
  
  if (!val || isNaN(val)) {
    showToast("Masukkan angka yang valid", 'error');
    return;
  }
  
  try {
    const counterRef = doc(db, "counters", type);
    await setDoc(counterRef, { 
      value: Number(val),
      updatedAt: serverTimestamp()
    });
    
    showToast(`✓ ${type} awal disimpan: ${val}`, 'success');
    input.value = '';
    
  } catch (error) {
    console.error("Error setting initial:", error);
    showToast("Gagal menyimpan", 'error');
  }
};

// ===== UTILITY FUNCTIONS =====
window.toggleSettings = () => {
  const panel = elements.settingsPanel();
  if (panel) {
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  }
};

window.resetLocalData = () => {
  if (confirm("Reset cache lokal? Ini tidak akan menghapus data di server.")) {
    localStorage.clear();
    sessionStorage.clear();
    showToast("Cache direset", 'info');
    setTimeout(() => location.reload(), 1000);
  }
};

window.createFirestoreIndex = () => {
  const projectId = "nomor-surat-pkm"; // Hardcode karena firebaseConfig tidak di-export
  const link = `https://console.firebase.google.com/project/${projectId}/firestore/indexes?create_composite=ClZwcm9qZWN0cy9ub21vci1zdXJhdC1wa20vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2hpc3RvcnkvaW5kZXhlcy9fEAEaCAoEdHlwZRACGgwKCHRpbWVzdGFtcBABGgwKCGNyZWF0ZWRBdAAB`;
  window.open(link, '_blank');
  showToast("Buka Firebase Console untuk buat index", 'info');
};

// ===== INITIALIZATION =====
function initializeApp() {
  console.log("🚀 Starting application...");
  
  // Set bulan dan tahun otomatis
  const { bulan, tahun } = getCurrentBulanTahun();
  elements.bulan().value = bulan;
  elements.tahun().value = tahun;
  
  // Load initial data
  loadAllData();
  
  // Auto-refresh setiap 30 detik
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      loadAllData();
    }
  }, 30000);
  
  // Handle tab visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log("🔄 Tab aktif, refreshing...");
      loadAllData();
    }
  });
  
  // Global error handling
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast("Terjadi kesalahan, refresh halaman jika perlu", 'error');
  });
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
