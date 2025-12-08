<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LoginView from './components/LoginView.vue';
import DashboardLayout from './components/DashboardLayout.vue';
import DocumentCard from './components/DocumentCard.vue';

// --- STATE ---
const token = ref(localStorage.getItem('token') || '');
const documents = ref([]);
const fileInput = ref(null);
const isUploading = ref(false);
let pollingInterval = null;

// --- ACTIONS ---
const handleLoginSuccess = (newToken) => {
  token.value = newToken;
  localStorage.setItem('token', newToken);
  fetchDocuments();
  startPolling();
};

const logout = () => {
  token.value = '';
  localStorage.removeItem('token');
  documents.value = [];
  clearInterval(pollingInterval);
};

const fetchDocuments = async () => {
  if (!token.value) return;
  try {
    const res = await fetch('http://localhost:3000/api/documents', {
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
    if (res.status === 401 || res.status === 403) return logout();
    documents.value = await res.json();
  } catch (err) { console.error(err); }
};

const uploadFile = async () => {
  const file = fileInput.value?.files[0];
  if (!file) return;
  isUploading.value = true;
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token.value}` },
      body: formData
    });
    fileInput.value.value = ""; 
    await fetchDocuments();
  } catch (err) { console.error(err); } 
  finally { isUploading.value = false; }
};

const startPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(fetchDocuments, 2000);
};

onMounted(() => {
  if (token.value) {
    fetchDocuments();
    startPolling();
  }
});

onUnmounted(() => clearInterval(pollingInterval));
</script>

<template>
  <LoginView v-if="!token" @login-success="handleLoginSuccess" />

  <DashboardLayout v-else @logout="logout">
    
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
        No documents found. Start by uploading an invoice.
      </div>

      <div class="grid-layout">
        <DocumentCard 
          v-for="doc in documents" 
          :key="doc.id" 
          :doc="doc" 
        />
      </div>
    </section>

  </DashboardLayout>
</template>

<style scoped>
/* App specific styles for the content inside the dashboard slot */
.top-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
.top-header h1 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin: 0; }
.top-header .date { color: #94a3b8; font-weight: 500; }

.upload-container { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 32px; display: flex; justify-content: center; }
.file-drop-area { text-align: center; width: 100%; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 30px; background: #f8fafc; transition: 0.2s; }
.file-drop-area:hover { border-color: #3b82f6; background: #eff6ff; }
.upload-icon { font-size: 2rem; display: block; margin-bottom: 8px; }
.hidden-input { display: none; }
.upload-btn-outline { display: inline-block; margin-top: 10px; padding: 8px 20px; border: 1px solid #cbd5e1; background: white; border-radius: 6px; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
.upload-btn-outline:hover { border-color: #3b82f6; color: #3b82f6; }

.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.section-header h2 { font-size: 1.2rem; font-weight: 600; margin: 0; }
.badge-count { background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.empty-state { color: #64748b; font-style: italic; }
</style>