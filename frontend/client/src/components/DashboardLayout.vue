<script setup>
defineProps({
  user: String
});
defineEmits(['logout']);
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="web-container">
      
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand-logo">SmartDoc<span>.app</span></div>
        </div>
        <nav class="nav-links">
          <a href="#" class="nav-item active"><span class="icon">📄</span> Documents</a>
          <a href="#" class="nav-item"><span class="icon">⚙️</span> Settings</a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="avatar">A</div>
            <div class="user-details">
              <span class="name">Admin User</span>
              <span class="role">Workspace Owner</span>
            </div>
          </div>
          <button @click="$emit('logout')" class="logout-btn">Log out</button>
        </div>
      </aside>

      <main class="main-content">
        <slot></slot>
      </main>

    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper { background-color: #f8fafc; min-height: 100vh; display: flex; justify-content: center; }

/* WEB VIEW FIX: Restrict width and center */
.web-container { 
  display: flex; 
  width: 100%; 
  max-width: 1440px; /* Standard Web Resolution */
  background: white; 
  box-shadow: 0 0 20px rgba(0,0,0,0.03); 
  height: 100vh;
}

.sidebar { width: 260px; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; padding: 24px; background: #fff; }
.brand-logo { font-weight: 700; font-size: 1.25rem; color: #0f172a; margin-bottom: 32px; }
.brand-logo span { color: #3b82f6; }

.nav-links { display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #64748b; padding: 10px 12px; border-radius: 6px; font-weight: 500; transition: 0.2s; }
.nav-item:hover { background: #f1f5f9; color: #334155; }
.nav-item.active { background: #eff6ff; color: #3b82f6; font-weight: 600; }

.sidebar-footer { margin-top: auto; border-top: 1px solid #f1f5f9; padding-top: 20px; }
.user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.avatar { width: 32px; height: 32px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
.user-details { display: flex; flex-direction: column; }
.user-details .name { font-size: 0.9rem; font-weight: 600; }
.user-details .role { font-size: 0.75rem; color: #94a3b8; }
.logout-btn { background: none; border: none; color: #ef4444; font-size: 0.85rem; cursor: pointer; padding: 0; }

.main-content { flex: 1; padding: 32px; overflow-y: auto; background: #f8fafc; }
</style>