<template>
  <div id="app" :class="{ 'dark-theme': isDark }">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Project Lifecycle Dashboard</h1>
      </div>
      <div class="nav-links">
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色主题' : '切换暗色主题'">
          <!-- 太阳图标 -->
          <svg v-if="isDark" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <!-- 月亮图标 -->
          <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
        <router-link to="/" class="nav-link">Overview</router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
}

// Provide theme state to child components
provide('isDark', isDark)
</script>

<style>
:root {
  /* Light theme colors */
  --bg-primary: #f5f5f5;
  --bg-white: #ffffff;
  --bg-sidebar: #f8f9fa;
  --bg-card: #ffffff;
  --bg-input: #ffffff;
  --bg-hover: #e3f2fd;
  --border-color: #e0e0e0;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-muted: #999999;
  --accent-color: #2196f3;
  --accent-hover: #1976d2;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.2);
}

#app.dark-theme {
  /* Dark theme colors */
  --bg-primary: #0f172a;
  --bg-white: #1e293b;
  --bg-sidebar: #111827;
  --bg-card: #1f2937;
  --bg-input: #374151;
  --bg-hover: #1f2937;
  --border-color: #374151;
  --text-primary: #e0e0e0;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  --accent-color: #60a5fa;
  --accent-hover: #64b5f6;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.5);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  background: var(--bg-white);
  box-shadow: var(--shadow-sm);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.nav-brand h1 {
  font-size: 1.5rem;
  color: var(--accent-color);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  color: var(--text-secondary);
}

.theme-toggle:hover {
  background: var(--bg-hover);
}

.theme-icon {
  width: 20px;
  height: 20px;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--accent-color);
}

.main-content {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
