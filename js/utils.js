// FarmLedger V2 - Shared Utilities

// ── Format PKR ──────────────────────────────────────────────
export function fmt(n) {
  const num = Number(n || 0);
  if (num >= 10000000) return '₨ ' + (num/10000000).toFixed(1) + 'Cr';
  if (num >= 100000)   return '₨ ' + (num/100000).toFixed(1) + 'L';
  return '₨ ' + num.toLocaleString('en-PK');
}
export function fmtFull(n) { return '₨ ' + Number(n||0).toLocaleString('en-PK'); }

// ── Today's date ─────────────────────────────────────────────
export function today() { return new Date().toISOString().slice(0,10); }

// ── Toast Notifications ───────────────────────────────────────
let toastContainer;
export function showToast(msg, type='success', duration=3500) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]||'✅'}</span><span>${msg}</span>`;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ── Modal helpers ─────────────────────────────────────────────
export function openModal(id) { document.getElementById(id)?.classList.add('open'); }
export function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// ── Online/Offline indicator ──────────────────────────────────
export function initOnlineIndicator() {
  const el = document.getElementById('onlineIndicator');
  const banner = document.getElementById('offlineBanner');
  function update() {
    const online = navigator.onLine;
    if (el) {
      el.className = `online-indicator ${online ? 'online' : 'offline'}`;
      el.innerHTML = `<div class="online-dot"></div>${online ? 'Online' : 'Offline'}`;
    }
    if (banner) banner.classList.toggle('show', !online);
  }
  window.addEventListener('online',  () => { update(); showToast('Back online! Syncing data...', 'success'); });
  window.addEventListener('offline', () => { update(); showToast('You are offline. Changes will sync later.', 'warning'); });
  update();
}

// ── Firestore offline persistence ────────────────────────────
export async function enableOffline(db) {
  const { enableIndexedDbPersistence } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
  try { await enableIndexedDbPersistence(db); } catch(e) { /* already enabled or unsupported */ }
}

// ── Generate readable ID ──────────────────────────────────────
export async function generateId(db, type) {
  const { doc, runTransaction } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
  const prefixes = { landlord:'LND', manager:'MGR', farmer:'FRM', farm:'FARM', activity:'ACT', harvest:'HRV' };
  const prefix = prefixes[type] || 'ID';
  const ref = doc(db, 'counters', type + 's');
  let newId;
  await runTransaction(db, async tx => {
    const snap = await tx.get(ref);
    const count = snap.exists() ? (snap.data().count||0)+1 : 1;
    tx.set(ref, { count });
    newId = `${prefix}-${String(count).padStart(3,'0')}`;
  });
  return newId;
}

// ── Weather fetch ─────────────────────────────────────────────
export async function fetchWeather(city) {
  try {
    const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    if (!r.ok) return null;
    const d = await r.json();
    const c = d.current_condition[0];
    const a = d.nearest_area[0];
    return {
      temp: c.temp_C, feels: c.FeelsLikeC, humidity: c.humidity,
      wind: c.windspeedKmph, desc: c.weatherDesc[0].value,
      city: a.areaName[0].value + ', ' + a.country[0].value
    };
  } catch { return null; }
}

// ── Get weather icon ──────────────────────────────────────────
export function weatherIcon(desc) {
  const d = (desc||'').toLowerCase();
  if (d.includes('sunny')||d.includes('clear')) return '☀️';
  if (d.includes('cloud')||d.includes('overcast')) return '☁️';
  if (d.includes('rain')||d.includes('drizzle')) return '🌧️';
  if (d.includes('snow')) return '❄️';
  if (d.includes('thunder')) return '⛈️';
  if (d.includes('fog')||d.includes('mist')) return '🌫️';
  return '🌤️';
}

// ── Print helper ──────────────────────────────────────────────
export function printReport(html, title='FarmLedger Report') {
  const w = window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Sora',Arial,sans-serif;padding:32px;color:#1a1f1a;font-size:13px}
    .header{text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #1a5c1e}
    .header h1{color:#1a5c1e;font-size:22px;font-weight:800}
    .header p{color:#6b8c6b;font-size:12px;margin-top:4px}
    .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
    .sum-box{background:#f4f6f4;border-radius:10px;padding:14px;text-align:center}
    .sum-box .lbl{font-size:11px;color:#6b8c6b;font-weight:700;text-transform:uppercase}
    .sum-box .val{font-size:16px;font-weight:800;margin-top:4px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    th{background:#e8f5e9;color:#1a5c1e;font-weight:700;font-size:11px;text-transform:uppercase;padding:10px 12px;text-align:left;border-bottom:2px solid #d4e4d4}
    td{padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:12px}
    tr:last-child td{border-bottom:none}
    .section-title{font-size:14px;font-weight:800;color:#1a5c1e;margin:20px 0 10px;padding-bottom:6px;border-bottom:1px solid #d4e4d4}
    .profit-row{background:#f1f8e9;font-weight:800}
    @media print{button{display:none}}
  </style></head><body>${html}
  <script>window.onload=()=>setTimeout(()=>window.print(),300);<\/script>
  </body></html>`);
  w.document.close();
}

// ── Market prices (Pakistan crops) ───────────────────────────
export const MARKET_PRICES = [
  { crop:'Wheat',   urdu:'گندم',   icon:'🌾', price:3400,  unit:'40kg', change:+2.1 },
  { crop:'Rice',    urdu:'چاول',   icon:'🍚', price:5200,  unit:'40kg', change:-1.3 },
  { crop:'Cotton',  urdu:'کپاس',   icon:'🌿', price:8500,  unit:'40kg', change:+3.5 },
  { crop:'Maize',   urdu:'مکئی',   icon:'🌽', price:2100,  unit:'40kg', change:+0.8 },
  { crop:'Mustard', urdu:'سرسوں',  icon:'🟡', price:9200,  unit:'40kg', change:-0.5 },
  { crop:'Potato',  urdu:'آلو',    icon:'🥔', price:1800,  unit:'40kg', change:+4.2 },
  { crop:'Onion',   urdu:'پیاز',   icon:'🧅', price:2400,  unit:'40kg', change:-2.8 },
  { crop:'Sugar',   urdu:'گنا',    icon:'🎋', price:450,   unit:'40kg', change:+1.0 },
];

// ── Sidebar toggle ────────────────────────────────────────────
export function initSidebar() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!toggle||!sidebar) return;
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  });
  if (overlay) overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}

// ── Tab switching ─────────────────────────────────────────────
export function initTabs(containerId) {
  document.querySelectorAll(`#${containerId} .nav-item[data-tab]`).forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      document.querySelectorAll(`#${containerId} .nav-item[data-tab]`).forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('[data-tab-content]').forEach(c => {
        c.classList.toggle('hidden', c.dataset.tabContent !== tab);
      });
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('sidebarOverlay')?.classList.remove('show');
      document.getElementById('pageBreadcrumb').textContent = item.textContent.trim();
    });
  });
}

// ── Auth guard ────────────────────────────────────────────────
export function initAuthGuard(auth, db, allowedRole, onSuccess) {
  const { onAuthStateChanged } = window.__fbAuth__;
  const { doc, getDoc } = window.__fbFirestore__;
  onAuthStateChanged(auth, async user => {
    if (!user) { window.location.href = '../index.html'; return; }
    try {
      const snap = await getDoc(doc(db,'users',user.uid));
      if (!snap.exists()) { window.location.href = '../index.html'; return; }
      const data = snap.data();
      if (data.role !== allowedRole) {
        const routes = { admin:'admin.html', landlord:'landlord.html', manager:'manager.html' };
        window.location.href = routes[data.role] || '../index.html'; return;
      }
      onSuccess({ uid: user.uid, ...data });
    } catch(e) { window.location.href = '../index.html'; }
  });
}
