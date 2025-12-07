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
  <div class="container">
    <header>
      <h1>🤖 nolas Workspace Practice</h1>
      <p>AI Document Processor</p>
    </header>

    <div class="upload-section">
      <input type="file" ref="fileInput" accept=".pdf,.png,.jpg,.txt" />
      <button @click="uploadFile" :disabled="isUploading">
        {{ isUploading ? 'Uploading...' : 'Upload & Process' }}
      </button>
    </div>

    <div class="documents-list">
      <h2>Recent Documents</h2>
      
      <div v-if="documents.length === 0" class="empty-state">
        No documents uploaded yet.
      </div>

      <div v-for="doc in documents" :key="doc.id" class="doc-card">
        <div class="doc-header">
          <strong>{{ doc.originalName }}</strong>
          <span :class="['status-badge', doc.status.toLowerCase()]">
            {{ doc.status }}
          </span>
        </div>
        
        <div class="doc-details">
          <small>ID: {{ doc.id }}</small>
          
          <div v-if="doc.status === 'COMPLETED'" class="ai-result">
            <p><strong>💡 AI Summary:</strong> {{ doc.data.summary }}</p>
            <p><strong>💰 Detected Amount:</strong> ${{ doc.data.amount }}</p>
          </div>
          <div v-else class="processing-state">
             ⚙️ AI Agent is analyzing...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Simple CSS for layout */
.container { max-width: 600px; margin: 0 auto; font-family: sans-serif; padding: 20px; }
header { text-align: center; margin-bottom: 30px; }
.upload-section { display: flex; gap: 10px; margin-bottom: 30px; padding: 20px; background: #f4f4f4; border-radius: 8px; }
button { padding: 10px 20px; background: #333; color: white; border: none; cursor: pointer; border-radius: 4px; }
button:disabled { background: #999; }

.doc-card { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.doc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }

.status-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }
.status-badge.processing { background: #fff3cd; color: #856404; }
.status-badge.completed { background: #d4edda; color: #155724; }

.ai-result { margin-top: 10px; padding: 10px; background: #eefbff; border-left: 3px solid #007bff; }
.processing-state { margin-top: 10px; font-style: italic; color: #666; }
</style>