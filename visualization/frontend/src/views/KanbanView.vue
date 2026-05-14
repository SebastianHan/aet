<template>
  <div class="kanban-view">
    <div class="kanban-header">
      <h1>📊 项目看板</h1>
      <div class="header-actions">
        <router-link to="/artifacts" class="artifact-link">
          📦 PRD文件
        </router-link>
        <div class="dropdown" ref="dropdownRef">
          <button class="dropdown-btn" @click="toggleFilter">
            筛选 ▼
          </button>
          <div v-if="showFilter" class="dropdown-menu">
            <label><input type="checkbox" v-model="filterOptions.showAssignee"> 显示开发者</label>
            <label><input type="checkbox" v-model="filterOptions.showUrl"> 显示链接</label>
          </div>
        </div>
      </div>
    </div>

    <div class="kanban-container">
      <div class="project-sidebar">
        <h3>项目列表</h3>
        <div 
          v-for="project in projects" 
          :key="project.id"
          class="project-item"
          :class="{ active: selectedProjectId === project.id }"
          @click="selectProject(project.id)"
        >
          {{ project.name }}
        </div>
        <div v-if="projects.length === 0" class="no-projects">
          暂无项目
        </div>
      </div>

      <div class="kanban-board">
        <div 
          v-for="phase in phases" 
          :key="phase.id"
          class="phase-column"
        >
          <div class="phase-header" :style="{ borderTopColor: phase.color }">
            <span class="phase-name">{{ phase.label }}</span>
            <span class="phase-count">{{ phase.issues.length }}</span>
          </div>
          <div class="phase-content">
            <div 
              v-for="issue in phase.issues" 
              :key="issue.id"
              class="issue-card"
              @click="viewIssue(issue)"
            >
              <div class="issue-card-header">
                <a 
                  class="issue-number-link" 
                  :href="getIssueWebUrl(issue)" 
                  target="_blank"
                  @click.stop
                >
                  #{{ issue.issue_number }}
                </a>
                <span class="issue-state" :class="issue.state">{{ issue.state }}</span>
              </div>
              <div class="issue-title">{{ issue.title }}</div>
              <div v-if="filterOptions.showAssignee && issue.assignee_display" class="issue-assignee">
                👤 {{ issue.assignee_display }}
              </div>
              <div v-if="filterOptions.showUrl && issue.web_url" class="issue-url">
                🔗 <a :href="issue.web_url" target="_blank" @click.stop>查看链接</a>
              </div>
            </div>
            <div v-if="phase.issues.length === 0" class="empty-phase">
              暂无issues
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../api/client.js'

const router = useRouter()

const projects = ref([])
const phases = ref([])
const selectedProjectId = ref(null)
const loading = ref(false)
const error = ref(null)
const showFilter = ref(false)
const dropdownRef = ref(null)

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showFilter.value = false
  }
}

const filterOptions = ref({
  showAssignee: true,
  showUrl: true
})

const toggleFilter = () => {
  showFilter.value = !showFilter.value
}

const getStatusLabel = (status) => {
  const labels = {
    'pending': '待开始',
    'in_progress': '进行中',
    'completed': '已完成'
  }
  return labels[status] || '未知'
}

const fetchKanban = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await apiClient.get('/projects/kanban', {})
    projects.value = response.data.data.projects
    
    if (!selectedProjectId.value && projects.value.length > 0) {
      selectedProjectId.value = projects.value[0].id
    }
    
    const params = {}
    if (selectedProjectId.value) {
      params.project_id = selectedProjectId.value
    }
    const kanbanResponse = await apiClient.get('/projects/kanban', { params })
    phases.value = kanbanResponse.data.data.phases
    
  } catch (err) {
    error.value = 'Failed to fetch kanban data'
    console.error('Error fetching kanban:', err)
  } finally {
    loading.value = false
  }
}

const selectProject = (projectId) => {
  selectedProjectId.value = projectId
}

const getIssueWebUrl = (issue) => {
  if (issue.web_url) return issue.web_url
  const project = projects.value.find(p => p.id === selectedProjectId.value)
  if (!project?.name) return null
  const [owner, repo] = project.name.split('/')
  if (!owner || !repo) return null
  return `https://atomgit.com/${owner}/${repo}/issues/${issue.issue_number}`
}

const viewIssue = (issue) => {
  router.push({ path: `/issues/${issue.id}`, query: { projectId: selectedProjectId.value } })
}

watch(selectedProjectId, () => {
  fetchKanban()
})

onMounted(() => {
  fetchKanban()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.kanban-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.kanban-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  transition: background-color 0.3s, border-color 0.3s;
}

.kanban-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.artifact-link {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s;
}

.artifact-link:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color);
}

.dropdown {
  position: relative;
}

.dropdown-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-primary);
  transition: all 0.2s;
}

.dropdown-btn:hover {
  background: var(--bg-hover);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.5rem;
  min-width: 150px;
  box-shadow: var(--shadow-md);
  z-index: 100;
  transition: background-color 0.3s, border-color 0.3s;
}

.dropdown-menu label {
  display: block;
  padding: 0.25rem 0;
  cursor: pointer;
  color: var(--text-primary);
  transition: color 0.3s;
}

.kanban-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.project-sidebar {
  width: 200px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  padding: 1rem;
  overflow-y: auto;
  flex-shrink: 0;
  transition: background-color 0.3s, border-color 0.3s;
}

.project-sidebar h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--text-primary);
  transition: color 0.3s;
}

.project-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
}

.project-item:hover {
  background: var(--bg-hover);
}

.project-item.active {
  background: var(--accent-color);
  color: white;
}

.no-projects {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.kanban-board {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  overflow-x: auto;
  flex: 1;
  background: var(--bg-primary);
  transition: background-color 0.3s;
}

.phase-column {
  min-width: 250px;
  max-width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  transition: background-color 0.3s;
}

.phase-header {
  padding: 1rem;
  background: var(--bg-white);
  border-top: 4px solid #9e9e9e;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s, border-top-color 0.3s;
}

.phase-name {
  font-weight: bold;
  color: var(--text-primary);
  transition: color 0.3s;
}

.phase-count {
  background: var(--bg-primary);
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: background-color 0.3s, color 0.3s;
}

.phase-content {
  flex: 1;
  padding: 0.5rem;
  overflow-y: auto;
}

.issue-card {
  background: var(--bg-card);
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.issue-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.issue-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.issue-number {
  font-weight: bold;
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: color 0.3s;
}

.issue-number-link {
  font-weight: bold;
  color: var(--accent-color);
  font-size: 0.875rem;
  text-decoration: none;
  cursor: pointer;
}

.issue-number-link:hover {
  text-decoration: underline;
}

.issue-state {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  text-transform: uppercase;
}

.issue-state.open {
  background: #4caf50;
  color: white;
}

.issue-state.closed {
  background: #f44336;
  color: white;
}

.issue-title {
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
  transition: color 0.3s;
}

.issue-assignee, .issue-url {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  transition: color 0.3s;
}

.issue-url a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.3s;
}

.issue-url a:hover {
  text-decoration: underline;
}

.issue-details {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.7rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  transition: border-color 0.3s, color 0.3s;
}

.empty-phase {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem 0;
  font-size: 0.875rem;
  transition: color 0.3s;
}
</style>