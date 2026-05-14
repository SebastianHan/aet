<template>
  <div class="issue-detail-view">
    <h1>Issue Details</h1>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="detail-container">
      <div class="sidebar">
        <IssueList 
          :project-id="projectId"
          :project-name="projectName"
          :initial-issue-id="route.params.issueId ? parseInt(route.params.issueId) : null"
          @select-issue="selectIssue"
          ref="issueListRef"
        />
      </div>
      
      <div class="main-content">
        <div v-if="selectedIssue" class="issue-info">
          <h2>{{ selectedIssue.title }}</h2>
          <div class="issue-meta">
            <span class="issue-number">#{{ selectedIssue.issue_number }}</span>
            <span class="issue-state" :class="selectedIssue.state">{{ selectedIssue.state }}</span>
            <span v-if="selectedIssue.assignee_display" class="issue-assignee">👤 {{ selectedIssue.assignee_display }}</span>
            <span class="issue-date">{{ formatDate(selectedIssue.created_at) }}</span>
          </div>
          <div v-if="selectedIssue.web_url" class="issue-web-url">
            🔗 <a :href="selectedIssue.web_url" target="_blank">查看原 Issue: {{ selectedIssue.web_url }}</a>
          </div>
          <p v-if="selectedIssue.description" class="issue-description">
            {{ selectedIssue.description }}
          </p>
          <a v-if="selectedIssue.web_url" :href="selectedIssue.web_url" 
             target="_blank" class="view-link">
            View on GitCode →
          </a>
        </div>
        
        <div v-else class="no-selection">
          <p>Select an issue from the list to view details</p>
          <p class="hint">Click on any issue in the sidebar to see its progress timeline</p>
        </div>
        
        <div v-if="selectedIssue" class="progress-section">
          <IssueProgress :issue-id="selectedIssue.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import IssueList from '../components/IssueList.vue'
import IssueProgress from '../components/IssueProgress.vue'
import apiClient from '../api/client.js'

const route = useRoute()

const projectId = computed(() => {
  if (route.query.projectId) {
    return parseInt(route.query.projectId)
  }
  return parseInt(import.meta.env.VITE_PROJECT_ID || '1')
})

const projectName = ref('')
const selectedIssue = ref(null)
const loading = ref(false)
const error = ref(null)
const issueListRef = ref(null)

const fetchProjectName = async () => {
  try {
    const resp = await apiClient.get('/projects/kanban')
    const projects = resp.data.data.projects
    const proj = projects.find(p => p.id === projectId.value)
    if (proj) {
      projectName.value = proj.name
    }
  } catch (e) {
    console.error('Failed to fetch project name:', e)
  }
}

const selectIssue = async (issue) => {
  selectedIssue.value = issue
  if (issueListRef.value) {
    issueListRef.value.selectIssue(issue.id)
  }
}

watch(() => route.params.issueId, (newIssueId) => {
  if (newIssueId) {
    loadIssueById(newIssueId)
  }
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const loadIssueById = async (issueId) => {
  loading.value = true
  error.value = null
  try {
    console.log('Loading issue by ID:', issueId)
    const response = await apiClient.get(`/projects/${projectId.value}/issues`)
    console.log('Issues response:', response.data)
    const issues = response.data.data
    console.log('Looking for issue with id:', parseInt(issueId), 'in', issues.length, 'issues')
    const issue = issues.find(i => i.id === parseInt(issueId))
    if (issue) {
      console.log('Found issue:', issue)
      selectedIssue.value = issue
    } else {
      console.error('Issue not found with id:', parseInt(issueId))
      error.value = 'Issue not found'
    }
  } catch (err) {
    error.value = 'Failed to load issue'
    console.error('Error loading issue:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('IssueDetailView mounted')
  console.log('Route params:', route.params)
  console.log('Has issueId:', !!route.params.issueId)
  console.log('IssueId value:', route.params.issueId)
  
  fetchProjectName()
  
  if (route.params.issueId) {
    loadIssueById(route.params.issueId)
  } else {
    console.log('No issueId in route params, showing default view')
  }
})
</script>

<style scoped>
.issue-detail-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.detail-container {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
}

.issue-info {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s, box-shadow 0.3s;
}

.issue-info h2 {
  margin-top: 0;
  color: var(--text-primary);
}

.issue-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.issue-number {
  font-weight: bold;
  color: var(--text-secondary);
}

.issue-state {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: bold;
}

.issue-state.open {
  background-color: #4caf50;
  color: white;
}

.issue-state.closed {
  background-color: #f44336;
  color: white;
}

.issue-assignee {
  color: var(--accent-color);
  font-weight: bold;
}

.issue-web-url {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.issue-web-url a {
  color: var(--accent-color);
  text-decoration: none;
  word-break: break-all;
}

.issue-web-url a:hover {
  text-decoration: underline;
}

.issue-date {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.issue-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

.view-link {
  display: inline-block;
  margin-top: 1rem;
  color: var(--accent-color);
  text-decoration: none;
  font-weight: bold;
}

.view-link:hover {
  text-decoration: underline;
}

.no-selection {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s, box-shadow 0.3s;
}

.hint {
  margin-top: 1rem;
  font-size: 0.875rem;
}

.progress-section {
  margin-top: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.error {
  color: #f44336;
}

@media (max-width: 768px) {
  .detail-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
</style>
