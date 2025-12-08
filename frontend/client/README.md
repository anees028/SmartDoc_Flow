# 💻 SmartDoc Flow - Frontend Client

A modern, responsive Single Page Application (SPA) built with Vue.js 3 and Vite. It serves as the user interface for the SmartDoc Workflow platform, allowing users to upload documents, visualize real-time AI processing status, and manage their workspace securely.

## 🚀 Key Features

- **Modern Stack**: Built with Vue 3 Composition API (`<script setup>`) for clean, reusable logic.
- **Component-Based Architecture**: Modular design using atomic components (`DocumentCard`) and layout wrappers (`DashboardLayout`).
- **Real-Time Feedback**: Implements Interval Polling to update document status (Processing → Completed) without page reloads.
- **Secure Authentication**: Handles JWT storage in `localStorage` and attaches Bearer tokens to every API request automatically.
- **Responsive "Web View"**: Optimized layout that looks great on laptops and large monitors (max-width constrained) while remaining fully responsive.
- **Smart UI States**: Skeleton loading screens and dynamic status badges (e.g., "AI Analyzing...") to improve User Experience (UX).

## 📂 Project Structure

The project follows a clean directory structure separating Views, Components, and Global Assets.
```
client/
│
├── public/                 # Static assets (Favicons, etc.)
├── src/
│   ├── components/         # Reusable Vue Components
│   │   ├── LoginView.vue       # Authentication Screen (Full width)
│   │   ├── DashboardLayout.vue # Sidebar + Main Content Wrapper
│   │   └── DocumentCard.vue    # Atomic Card Component for Docs
│   │   
│   ├── App.vue             # Main Application Orchestrator
│   ├── main.js             # Entry Point (Mounts Vue)
│   └── style.css           # Global Resets & Variables
│
├── index.html              # HTML Root
├── vite.config.js          # Build Configuration
└── package.json            # Dependencies
```

## 🛠️ Technology Stack

- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite (Super fast HMR)
- **Styling**: Native CSS (Scoped) + Flexbox/Grid Layouts
- **State Management**: Reactive Refs (Local State)

## ⚙️ Installation & Setup

### 1. Navigate to Client Folder
```bash
cd client
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The app will launch at `http://localhost:5173`

### 4. Verify Connection

- Ensure your Backend Server is running on `http://localhost:3000`.
- Login with the default credentials:
  - **User**: `admin`
  - **Pass**: `password`

---

## 📝 License

This project is part of the SmartDoc Flow platform.