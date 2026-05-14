<template>
  <div class="project-view">
    <h1>Project Overview</h1>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-value">{{ stats.total_issues }}</div>
          <div class="stat-label">Total Issues</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.open_issues }}</div>
          <div class="stat-label">Open Issues</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.closed_issues }}</div>
          <div class="stat-label">Closed Issues</div>
        </div>
      </div>

      <div class="distribution-section">
        <h2>Issue State Distribution</h2>
        <div class="progress-bar">
          <div class="progress-segment open" 
               :style="{ width: openPercentage + '%' }">
            Open: {{ stats.open_issues }} ({{ openPercentage.toFixed(1) }}%)
          </div>
          <div class="progress-segment closed" 
               :style="{ width: closedPercentage + '%' }">
            Closed: {{ stats.closed_issues }} ({{ closedPercentage.toFixed(1) }}%)
          </div>
        </div>
      </div>

      <div v-if="Object.keys(stats.issues_by_event_type).length > 0" class="event-distribution">
        <h2>Events by Type</h2>
        <div class="event-types">
          <div v-for="(count, type) in stats.issues_by_event_type" :key="type" class="event-type-item">
            <span class="event-type-name">{{ formatEventType(type) }}</span>
            <span class="event-type-count">{{ count }}</span>
          </div>
        </div>
      </div>

      <div class="phase-stats-section">
        <h2>阶段状态统计</h2>
        <div class="phase-stats-container">
          <div v-for="phase in ['design', 'development', 'testing']" :key="phase" class="phase-stat-card">
            <h3>{{ phase === 'design' ? '🎨 设计' : phase === 'development' ? '💻 开发' : '🧪 测试' }}</h3>
            <div class="phase-bar">
              <div class="bar-segment pending" :style="{ width: getPhasePercentage(phase, 'pending') + '%' }"></div>
              <div class="bar-segment in-progress" :style="{ width: getPhasePercentage(phase, 'in_progress') + '%' }"></div>
              <div class="bar-segment completed" :style="{ width: getPhasePercentage(phase, 'completed') + '%' }"></div>
            </div>
            <div class="phase-legend">
              <span>待开始: {{ phaseStats[phase].pending }}</span>
              <span>进行中: {{ phaseStats[phase].in_progress }}</span>
              <span>已完成: {{ phaseStats[phase].completed }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../api/client.js'

const route = useRoute()
const projectId = computed(() => {
  if (route.query.projectId) {
    return parseInt(route.query.projectId)
  }
  return parseInt(import.meta.env.VITE_PROJECT_ID || '1')
})
const stats = ref({
  total_issues: 0,
  open_issues: 0,
  closed_issues: 0,
  issues_by_state: {},
  issues_by_event_type: {}
})
const phaseStats = ref({
  design: { pending: 0, in_progress: 0, completed: 0 },
  development: { pending: 0, in_progress: 0, completed: 0 },
  testing: { pending: 0, in_progress: 0, completed: 0 }
})
const loading = ref(false)
const error = ref(null)

const openPercentage = computed(() => {
  if (stats.value.total_issues === 0) return 0
  return (stats.value.open_issues / stats.value.total_issues) * 100
})

const closedPercentage = computed(() => {
  if (stats.value.total_issues === 0) return 0
  return (stats.value.closed_issues / stats.value.total_issues) * 100
})

const fetchStats = async () => {
  loading.value = true
  error.value = null
  try {
    console.log('Fetching stats for project:', projectId.value)
    const response = await apiClient.get(`/projects/${projectId.value}/stats`)
    console.log('Response received:', response.data)
    stats.value = response.data.data
    
    const phaseResponse = await apiClient.get(`/projects/${projectId.value}/phases/stats`)
    phaseStats.value = phaseResponse.data.data
  } catch (err) {
    console.error('Error fetching stats:', err)
    error.value = `Failed to fetch project statistics: ${err.message || 'Unknown error'}`
  } finally {
    loading.value = false
  }
}

const formatEventType = (type) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const getPhasePercentage = (phase, status) => {
  const total = phaseStats.value[phase].pending + phaseStats.value[phase].in_progress + phaseStats.value[phase].completed
  if (total === 0) return 0
  return (phaseStats.value[phase][status] / total) * 100
}

watch(projectId, () => {
  fetchStats()
})

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.project-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  text-align: center;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.distribution-section {
  margin-top: 2rem;
}

.progress-bar {
  display: flex;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
  transition: width 0.3s ease;
}

.progress-segment.open {
  background-color: #4caf50;
}

.progress-segment.closed {
  background-color: #f44336;
}

.event-distribution {
  margin-top: 2rem;
}

.event-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.event-type-item {
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.event-type-name {
  color: var(--text-primary);
}

.event-type-count {
  font-weight: bold;
  color: var(--accent-color);
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.error {
  color: #f44336;
}

.phase-stats-section {
  margin-top: 2rem;
}

.phase-stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.phase-stat-card {
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s, box-shadow 0.3s;
}

.phase-stat-card h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.phase-bar {
  display: flex;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.bar-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  transition: width 0.3s ease;
}

.bar-segment.pending {
  background-color: #9e9e9e;
}

.bar-segment.in-progress {
  background-color: #2196f3;
}

.bar-segment.completed {
  background-color: #4caf50;
}

.phase-legend {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
}
</style>
