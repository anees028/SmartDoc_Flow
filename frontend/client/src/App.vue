<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// --- STATE MANAGEMENT ---
const token = ref(localStorage.getItem('token') || ''); 
const username = ref('');
const password = ref('');
const documents = ref([]);
const fileInput = ref(null);
const isUploading = ref(false);
let pollingInterval = null;

// --- AUTH FUNCTIONS ---
const login = async () => {
  if (!username.value || !password.value) return alert("Please enter credentials");
  
  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    });

    if (res.ok) {
      const data = await res.json();
      token.value = data.token;
      localStorage.setItem('token', data.token);
      fetchDocuments();
      startPolling();
    } else {
      alert("Login failed! (Try: admin / password)");
    }
  } catch (err) {
    console.error("Login failed", err);
    alert("Server error. Is Node running?");
  }
};

const logout = () => {
  token.value = '';
  localStorage.removeItem('token');
  documents.value = [];
  clearInterval(pollingInterval);
  username.value = '';
  password.value = '';
};

// --- DOCUMENT FUNCTIONS ---
const fetchDocuments = async () => {
  if (!token.value) return;

  try {
    const res = await fetch('http://localhost:3000/api/documents', {
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
    
    if (res.status === 401 || res.status === 403) {
       logout(); // Token expired or invalid
       return;
    }

    const data = await res.json();
    documents.value = data;
  } catch (err) {
    console.error("Error fetching docs:", err);
  }
};

const uploadFile = async () => {
  const file = fileInput.value?.files[0];
  if (!file) return;

  isUploading.value = true;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token.value}` },
      body: formData
    });

    if (res.ok) {
      fileInput.value.value = ""; // Clear input
      await fetchDocuments();
    }
  } catch (err) {
    console.error("Upload error:", err);
  } finally {
    isUploading.value = false;
  }
};

// --- LIFECYCLE ---
const startPolling = () => {
  // Poll every 2 seconds to check AI status
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(fetchDocuments, 2000);
};

onMounted(() => {
  if (token.value) {
    fetchDocuments();
    startPolling();
  }
});

onUnmounted(() => {
  clearInterval(pollingInterval);
});
</script>

<template>
  <div class="app-root">
    
    <div v-if="!token" class="login-wrapper">
      <div class="login-card">
        <div class="brand-logo">SmartDoc<span>.workspace</span></div>
        <h2>Sign In</h2>
        <p class="subtitle">Enter your details to access the AI workflow.</p>
        
        <form @submit.prevent="login">
          <div class="input-group">
            <label>Username</label>
            <input v-model="username" type="text" placeholder="e.g. admin" />
          </div>
          <div class="input-group">
            <label>Password</label>
            <input v-model="password" type="password" placeholder="e.g. password" />
          </div>
          <button type="submit" class="primary-btn full-width">Sign In</button>
        </form>
        
        <div class="login-footer">
          <small>Use <strong>admin</strong> / <strong>password</strong></small>
        </div>
      </div>
    </div>

    <div v-else class="dashboard-wrapper">
      
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand-logo">nolas<span>.ai</span></div>
        </div>
        
        <nav class="nav-links">
          <a href="#" class="nav-item active">
            <span class="icon">📄</span> Documents
          </a>
          <a href="#" class="nav-item">
            <span class="icon">⚙️</span> Settings
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="avatar">A</div>
            <div class="user-details">
              <span class="name">Admin User</span>
              <span class="role">Workspace Owner</span>
            </div>
          </div>
          <button @click="logout" class="logout-btn">Log out</button>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-header">
          <h1>Document Workflow</h1>
          <span class="date">{{ new Date().toLocaleDateString() }}</span>
        </header>

        <section class="action-bar">
          <div class="upload-container">
            <div class="file-drop-area">
              <span class="upload-icon">☁️</span>
              <p>Drag files here or</p>
              <input type="file" ref="fileInput" id="file" class="hidden-input" @change="uploadFile" />
              <label for="file" class="upload-btn-outline">
                {{ isUploading ? 'Uploading...' : 'Browse Files' }}
              </label>
            </div>
          </div>
        </section>

        <section class="document-section">
          <div class="section-header">
            <h2>Recent Documents</h2>
            <span class="badge-count">{{ documents.length }}</span>
          </div>

          <div v-if="documents.length === 0" class="empty-state">
            <p>No documents found. Start by uploading an invoice.</p>
          </div>

          <div class="grid-layout">
            <div v-for="doc in documents" :key="doc.id" class="doc-card">
              
              <div class="card-top">
                <div class="icon-box">📄</div>
                <div class="meta">
                  <span class="filename" :title="doc.originalName">{{ doc.originalName }}</span>
                  <span class="time">{{ new Date(doc.uploadTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
                </div>
              </div>

              <div class="card-content">
                <div v-if="doc.status === 'PROCESSING'" class="status-processing">
                   <div class="spinner"></div>
                   <span>AI Analyzing...</span>
                </div>
                
                <div v-else class="status-completed">
                  <div class="data-point">
                    <label>Summary</label>
                    <strong>{{ doc.data.summary }}</strong>
                  </div>
                  <div class="data-point">
                    <label>Amount</label>
                    <strong class="highlight-green">${{ doc.data.amount }}</strong>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <span :class="['status-pill', doc.status.toLowerCase()]">
                  {{ doc.status === 'COMPLETED' ? 'Done' : 'Processing' }}
                </span>
                <span class="id-tag">#{{ doc.id.slice(-4) }}</span>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>

  </div>
</template>

<style scoped>
/* --- GLOBAL RESET & VARS --- */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
.app-root {
  font-family: 'Inter', sans-serif;
  color: #334155; /* Slate 700 */
  background-color: #f8fafc; /* Slate 50 */
  min-height: 100vh;
}

/* --- COMMON UTILS --- */
.brand-logo { font-weight: 700; font-size: 1.25rem; color: #0f172a; }
.brand-logo span { color: #3b82f6; }
.primary-btn { background: #3b82f6; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.primary-btn:hover { background: #2563eb; }

/* --- 1. LOGIN SCREEN --- */
.login-wrapper { display: flex; align-items: center; justify-content: center; height: 100vh; background: #f1f5f9; }
.login-card { background: white; padding: 40px; width: 100%; max-width: 400px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); text-align: center; }
.subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 24px; }
.input-group { text-align: left; margin-bottom: 16px; }
.input-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; color: #475569; }
.input-group input { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; transition: 0.2s; }
.input-group input:focus { border-color: #3b82f6; ring: 2px solid #3b82f6; }
.full-width { width: 100%; padding: 12px; }
.login-footer { margin-top: 20px; font-size: 0.8rem; color: #94a3b8; }

/* --- 2. DASHBOARD LAYOUT --- */
.dashboard-wrapper { display: flex; height: 100vh; overflow: hidden; }

/* Sidebar (White Theme) */
.sidebar { width: 260px; background: white; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; padding: 24px; }
.sidebar-header { margin-bottom: 32px; }
.nav-links { display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #64748b; padding: 10px 12px; border-radius: 6px; font-weight: 500; transition: 0.2s; }
.nav-item:hover { background: #f1f5f9; color: #334155; }
.nav-item.active { background: #eff6ff; color: #3b82f6; font-weight: 600; }
.sidebar-footer { margin-top: auto; border-top: 1px solid #f1f5f9; padding-top: 20px; }
.user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.avatar { width: 32px; height: 32px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
.user-details { display: flex; flex-direction: column; }
.user-details .name { font-size: 0.9rem; font-weight: 600; color: #334155; }
.user-details .role { font-size: 0.75rem; color: #94a3b8; }
.logout-btn { background: none; border: none; color: #ef4444; font-size: 0.85rem; font-weight: 500; cursor: pointer; padding: 0; }

/* Main Content */
.main-content { flex: 1; padding: 32px; overflow-y: auto; background: #f8fafc; }
.top-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
.top-header h1 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin: 0; }
.top-header .date { color: #94a3b8; font-weight: 500; }

/* Upload Area */
.upload-container { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 32px; display: flex; justify-content: center; }
.file-drop-area { text-align: center; width: 100%; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 30px; background: #f8fafc; transition: 0.2s; }
.file-drop-area:hover { border-color: #3b82f6; background: #eff6ff; }
.upload-icon { font-size: 2rem; display: block; margin-bottom: 8px; }
.hidden-input { display: none; }
.upload-btn-outline { display: inline-block; margin-top: 10px; padding: 8px 20px; border: 1px solid #cbd5e1; background: white; border-radius: 6px; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
.upload-btn-outline:hover { border-color: #3b82f6; color: #3b82f6; }

/* Results Grid */
.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.section-header h2 { font-size: 1.2rem; font-weight: 600; margin: 0; }
.badge-count { background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }

/* Document Cards */
.doc-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
.doc-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }

.card-top { display: flex; gap: 12px; margin-bottom: 16px; }
.icon-box { background: #f1f5f9; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1.2rem; }
.meta { display: flex; flex-direction: column; overflow: hidden; }
.filename { font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.time { font-size: 0.75rem; color: #94a3b8; }

.card-content { flex: 1; background: #f8fafc; border-radius: 6px; padding: 12px; margin-bottom: 16px; min-height: 80px; display: flex; align-items: center; justify-content: center; }

/* Status Styles */
.status-processing { color: #d97706; display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; }
.spinner { width: 16px; height: 16px; border: 2px solid #fcd34d; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.status-completed { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.data-point { display: flex; justify-content: space-between; font-size: 0.9rem; }
.data-point label { color: #64748b; }
.highlight-green { color: #16a34a; }

.card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; }
.status-pill { padding: 4px 10px; border-radius: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.65rem; }
.status-pill.processing { background: #fffbeb; color: #b45309; }
.status-pill.completed { background: #dcfce7; color: #166534; }
.id-tag { color: #cbd5e1; font-family: monospace; }
</style>