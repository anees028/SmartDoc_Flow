<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// State Variables
const documents = ref([]);
const fileInput = ref(null);
const isUploading = ref(false);
let pollingInterval = null;

// --- API FUNCTIONS ---

// Fetch list of documents
const fetchDocuments = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/documents');
    const data = await res.json();
    documents.value = data;
  } catch (err) {
    console.error("Error fetching docs:", err);
  }
};

// Handle File Upload
const uploadFile = async () => {
  const file = fileInput.value.files[0];
  if (!file) return alert("Please select a file!");

  isUploading.value = true;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      // Clear input and refresh list
      fileInput.value.value = ""; 
      await fetchDocuments();
    }
  } catch (err) {
    console.error("Upload error:", err);
  } finally {
    isUploading.value = false;
  }
};

// --- LIFECYCLE HOOKS ---

onMounted(() => {
  fetchDocuments();
  // Poll every 2 seconds to see if AI finished
  pollingInterval = setInterval(fetchDocuments, 2000);
});

onUnmounted(() => {
  clearInterval(pollingInterval);
});
</script>

<template>
  <div class="app-wrapper">
    <aside class="sidebar">
      <div class="brand">SmartDoc<span>.ai</span></div>
      <nav>
        <a href="#" class="active">📄 Documents</a>
        <!-- <a href="#">⚙️ Settings</a> -->
      </nav>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <h1>Document Workflow</h1>
        <div class="user-profile">Dev Candidate</div>
      </header>

      <section class="upload-area">
        <div class="upload-card">
          <div class="upload-icon">☁️</div>
          <h3>Upload Invoice or Contract</h3>
          <p>AI will automatically extract data and assign status.</p>
          
          <div class="file-input-wrapper">
            <input type="file" ref="fileInput" id="file" class="file-input" />
            <label for="file" class="file-label">
              {{ isUploading ? 'Uploading...' : 'Choose File' }}
            </label>
            <button @click="uploadFile" class="primary-btn" :disabled="isUploading">
              Process
            </button>
          </div>
        </div>
      </section>

      <section class="results-area">
        <h2>Recent Activity</h2>
        
        <div v-if="documents.length === 0" class="empty-state">
          <p>No documents found. Upload one to see the AI in action.</p>
        </div>

        <div class="cards-grid">
          <div v-for="doc in documents" :key="doc.id" class="doc-card">
            
            <div class="card-header">
              <div class="file-info">
                <span class="file-icon">📄</span>
                <span class="filename" :title="doc.originalName">{{ doc.originalName }}</span>
              </div>
              <span :class="['status-badge', doc.status.toLowerCase()]">
                {{ doc.status === 'PROCESSING' ? '⟳ Processing' : '✓ Completed' }}
              </span>
            </div>

            <div class="card-body">
              
              <div v-if="doc.status === 'PROCESSING'" class="processing-view">
                <div class="skeleton-line title"></div>
                <div class="skeleton-line text"></div>
                <p class="animate-pulse">AI Agent is analyzing content...</p>
              </div>

              <div v-else class="completed-view">
                <div class="data-row">
                  <span class="label">Vendor / Summary</span>
                  <span class="value highlight">{{ doc.data.summary }}</span>
                </div>
                <div class="data-row">
                  <span class="label">Detected Amount</span>
                  <span class="value price">${{ doc.data.amount }}</span>
                </div>
                <div class="data-row">
                  <span class="label">Confidence Score</span>
                  <span class="value">{{ doc.data.confidence }}</span>
                </div>
              </div>

            </div>
            
            <div class="card-footer">
              <small>ID: {{ doc.id.slice(-6) }}</small>
              <small>{{ new Date(doc.uploadTime).toLocaleTimeString() }}</small>
            </div>

          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* --- Layout & Reset --- */
* { box-sizing: border-box; }
.app-wrapper { display: flex; min-height: 100vh; background-color: #f8f9fa; font-family: 'Inter', -apple-system, sans-serif; color: #2c3e50; }

/* --- Sidebar --- */
.sidebar { width: 250px; background: #1e293b; color: white; padding: 20px; display: flex; flex-direction: column; }
.brand { font-size: 1.5rem; font-weight: bold; margin-bottom: 40px; }
.brand span { color: #3b82f6; }
.sidebar nav a { color: #94a3b8; text-decoration: none; display: block; padding: 10px 0; font-size: 1.1rem; }
.sidebar nav a.active { color: white; font-weight: 600; }

/* --- Main Content --- */
.main-content { flex: 1; padding: 30px 50px; overflow-y: auto; }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.top-bar h1 { font-size: 1.8rem; font-weight: 700; margin: 0; }

/* --- Upload Section --- */
.upload-card { background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-bottom: 40px; border: 2px dashed #e2e8f0; }
.upload-icon { font-size: 3rem; margin-bottom: 10px; }
.file-input-wrapper { display: flex; justify-content: center; gap: 10px; margin-top: 20px; align-items: center; }
.file-input { display: none; }
.file-label { padding: 10px 20px; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; background: #f1f5f9; font-weight: 500; transition: 0.2s; }
.file-label:hover { background: #e2e8f0; }

.primary-btn { background: #3b82f6; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.primary-btn:hover { background: #2563eb; }
.primary-btn:disabled { background: #94a3b8; cursor: not-allowed; }

/* --- Results Grid --- */
.results-area h2 { margin-bottom: 20px; font-size: 1.2rem; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

/* --- Document Card --- */
.doc-card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; transition: transform 0.2s; display: flex; flex-direction: column; justify-content: space-between; }
.doc-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }

/* Card Header */
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
.file-info { display: flex; align-items: center; gap: 8px; overflow: hidden; }
.file-icon { font-size: 1.2rem; background: #eff6ff; padding: 8px; border-radius: 6px; }
.filename { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }

/* Status Badges */
.status-badge { font-size: 0.75rem; padding: 4px 8px; border-radius: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.status-badge.processing { background: #fff7ed; color: #c2410c; }
.status-badge.completed { background: #f0fdf4; color: #15803d; }

/* Card Body (Data) */
.card-body { margin-bottom: 15px; min-height: 80px; }
.data-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; border-bottom: 1px solid #f8fafc; padding-bottom: 8px; }
.data-row:last-child { border-bottom: none; }
.label { color: #64748b; }
.value { font-weight: 600; color: #334155; text-align: right; }
.value.price { color: #16a34a; font-size: 1rem; }
.value.highlight { color: #2563eb; }

/* Skeleton Loading Animation */
.skeleton-line { height: 12px; background: #e2e8f0; border-radius: 4px; margin-bottom: 8px; }
.skeleton-line.title { width: 60%; }
.skeleton-line.text { width: 90%; }
.animate-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; color: #94a3b8; font-size: 0.85rem; font-style: italic; margin-top: 10px; }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }

/* Card Footer */
.card-footer { display: flex; justify-content: space-between; margin-top: auto; padding-top: 15px; border-top: 1px solid #f1f5f9; color: #cbd5e1; font-size: 0.75rem; }
</style>