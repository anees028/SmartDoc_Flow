<script setup>
defineProps({
  doc: Object // Receives a single document object
});
</script>

<template>
  <div class="doc-card">
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
</template>

<style scoped>
.doc-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; height: 100%; }
.doc-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }

.card-top { display: flex; gap: 12px; margin-bottom: 16px; }
.icon-box { background: #f1f5f9; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1.2rem; }
.meta { display: flex; flex-direction: column; overflow: hidden; }
.filename { font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.time { font-size: 0.75rem; color: #94a3b8; }

.card-content { flex: 1; background: #f8fafc; border-radius: 6px; padding: 12px; margin-bottom: 16px; min-height: 80px; display: flex; align-items: center; justify-content: center; }

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