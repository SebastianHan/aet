<template>
  <div class="issue-list">
    <h3>Issues</h3>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-for="issue in issues" :key="issue.id" class="issue-item" 
           :class="{ active: selectedIssueId === issue.id }"
           @click="$emit('select-issue', issue)">
        <div class="issue-header">
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
        <div v-if="issue.assignee_display" class="issue-assignee">👤 {{ issue.assignee_display }}</div>
        <div v-if="issue.web_url" class="issue-url">
          🔗 <a :href="issue.web_url" target="_blank" @click.stop>查看链接</a>
        </div>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import apiClient from '../api/client.js'

const props = defineProps({
  projectId: {
    type: Number,
    required: true
  },
  initialIssueId: {
    type: Number,
    default: null
  },
  projectName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select-issue'])

const getIssueWebUrl = (issue) => {
  if (issue.web_url) return issue.web_url
  if (!props.projectName) return null
  const [owner, repo] = props.projectName.split('/')
  if (!owner || !repo) return null
  return `https://atomgit.com/${owner}/${repo}/issues/${issue.issue_number}`
}

const issues = ref([])
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const selectedIssueId = ref(null)

const fetchIssues = async (page = 1, autoSelect = true) => {
  loading.value = true
  error.value = null
  try {
    console.log('Fetching issues for project:', props.projectId, 'page:', page)
    const response = await apiClient.get(`/projects/${props.projectId}/issues`, {
      params: { page, per_page: 20 }
    })
    console.log('Issues response:', response.data)
    issues.value = response.data.data
    currentPage.value = response.data.pagination.page
    totalPages.value = response.data.pagination.total_pages
    console.log('Loaded issues:', issues.value.length, 'Total pages:', totalPages.value)
    
    // Select initial issue if provided, otherwise auto-select first issue if none selected
    if (props.initialIssueId && !selectedIssueId.value) {
      const targetIssue = issues.value.find(i => i.id === props.initialIssueId)
      if (targetIssue) {
        console.log('Selecting initial issue:', targetIssue)
        selectedIssueId.value = targetIssue.id
        emit('select-issue', targetIssue)
      }
    } else if (issues.value.length > 0 && !selectedIssueId.value && autoSelect) {
      console.log('Auto-selecting first issue:', issues.value[0])
      emit('select-issue', issues.value[0])
    }
  } catch (err) {
    error.value = 'Failed to fetch issues'
    console.error('Error fetching issues:', err)
  } finally {
    loading.value = false
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    fetchIssues(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchIssues(currentPage.value + 1)
  }
}

watch(() => props.projectId, () => {
  selectedIssueId.value = null
  fetchIssues(1, false)
})

watch(() => props.initialIssueId, (newId) => {
  if (newId && !selectedIssueId.value) {
    fetchIssues(1, false).then(() => {
      const targetIssue = issues.value.find(i => i.id === newId)
      if (targetIssue) {
        selectedIssueId.value = targetIssue.id
        emit('select-issue', targetIssue)
      }
    })
  }
})

onMounted(() => {
  fetchIssues(1, true)
})

defineExpose({
  selectIssue: (issueId) => {
    selectedIssueId.value = issueId
  }
})
</script>

<style scoped>
.issue-list {
  padding: 1rem;
  border-right: 1px solid var(--border-color);
}

.issue-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-card);
}

.issue-item:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-color);
}

.issue-item.active {
  background-color: var(--bg-hover);
  border-color: var(--accent-color);
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issue-number {
  font-weight: bold;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.issue-number-link {
  font-weight: bold;
  color: var(--accent-color);
  font-size: 0.875rem;
  text-decoration: none;
}

.issue-number-link:hover {
  text-decoration: underline;
}

.issue-title {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.issue-assignee {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.issue-url {
  margin-top: 0.25rem;
  font-size: 0.7rem;
}

.issue-url a {
  color: var(--accent-color);
  text-decoration: none;
}

.issue-url a:hover {
  text-decoration: underline;
}

.issue-state {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  display: inline-block;
}

.issue-state.open {
  background-color: #4caf50;
  color: white;
}

.issue-state.closed {
  background-color: #f44336;
  color: white;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.pagination button {
  padding: 0.5rem 1rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: var(--text-muted);
  cursor: not-allowed;
}

.loading, .error {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
}

.error {
  color: #f44336;
}
</style>
