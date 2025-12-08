<script setup>
import { ref } from 'vue';

const username = ref('');
const password = ref('');
const emit = defineEmits(['login-success']);

const handleLogin = async () => {
  if (!username.value || !password.value) return alert("Please enter credentials");

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    });

    if (res.ok) {
      const data = await res.json();
      emit('login-success', data.token);
    } else {
      alert("Login failed! (Try: admin / password)");
    }
  } catch (err) {
    console.error("Login Error", err);
    alert("Server error.");
  }
};
</script>

<template>
  <div class="login-page-container">
    <div class="login-card">
      <div class="brand-logo">SmartDoc<span>.app</span></div>
      <h2>Sign In</h2>
      <p class="subtitle">Enter your details to access the AI workflow.</p>
      
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="e.g. admin" />
        </div>
        <div class="input-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="e.g. password" />
        </div>
        <button type="submit" class="primary-btn">Sign In</button>
      </form>
      
      <div class="login-footer">
        <small>Use <strong>admin</strong> / <strong>password</strong></small>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Forces the container to fill the exact screen size */
.login-page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;       /* Full Viewport Width */
  height: 100vh;      /* Full Viewport Height */
  background-color: #ffffff; /* Pure White Background */
}

/* Card Styling */
.login-card {
  background: white;
  width: 100%;
  max-width: 400px; /* Keeps the form from getting too wide on Desktop */
  padding: 40px;
  /* Optional: Add a subtle border or shadow to separate form from background */
  /* border: 1px solid #e2e8f0; */
  /* box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); */
  text-align: center;
}

.brand-logo { font-weight: 700; font-size: 1.5rem; color: #0f172a; margin-bottom: 20px; }
.brand-logo span { color: #3b82f6; }

.subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 30px; }

.input-group { text-align: left; margin-bottom: 20px; }
.input-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: #475569; }
.input-group input { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 1rem; outline: none; box-sizing: border-box; }
.input-group input:focus { border-color: #3b82f6; }

.primary-btn { background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 6px; width: 100%; cursor: pointer; font-weight: 600; font-size: 1rem; transition: background 0.2s; }
.primary-btn:hover { background: #2563eb; }

.login-footer { margin-top: 24px; font-size: 0.8rem; color: #94a3b8; }
</style>