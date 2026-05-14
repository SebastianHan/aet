<template>
  <div class="issue-progress">
    <h3>Progress Timeline</h3>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="events.length === 0" class="no-events">No events recorded yet</div>
    <div v-else class="timeline">
      <div v-for="event in events" :key="event.id" class="timeline-item">
        <div class="timeline-marker">✅</div>
        <div class="timeline-content">
          <div class="event-type">{{ formatEventType(event.event_type) }}</div>
          <div v-if="event.user_id" class="event-user">by {{ event.user_id }}</div>
          <div class="event-time">{{ formatTime(event.timestamp) }}</div>
          <div v-if="event.metadata" class="event-metadata">
            <pre>{{ formatMetadata(event.metadata) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import apiClient from '../api/client.js'

const props = defineProps({
  issueId: {
    type: Number,
    required: true
  }
})

const events = ref([])
const loading = ref(false)
const error = ref(null)

const fetchEvents = async () => {
  if (!props.issueId) {
    console.log('No issueId provided to IssueProgress')
    return
  }
  
  loading.value = true
  error.value = null
  try {
    console.log('Fetching events for issue:', props.issueId)
    const response = await apiClient.get(`/issues/${props.issueId}/events`)
    console.log('Events response:', response.data)
    events.value = response.data.data
    console.log('Loaded events:', events.value.length)
  } catch (err) {
    error.value = 'Failed to fetch events'
    console.error('Error fetching events:', err)
  } finally {
    loading.value = false
  }
}

const formatEventType = (type) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

const formatMetadata = (metadata) => {
  try {
    const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata
    return JSON.stringify(parsed, null, 2)
  } catch {
    return metadata
  }
}

watch(() => props.issueId, () => {
  fetchEvents()
})

fetchEvents()
</script>

<style scoped>
.issue-progress {
  padding: 1rem;
}

.timeline {
  margin-top: 1rem;
}

.timeline-item {
  display: flex;
  margin-bottom: 1.5rem;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 12px;
  top: 32px;
  bottom: -16px;
  width: 2px;
  background-color: var(--border-color);
}

.timeline-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.timeline-content {
  margin-left: 1rem;
  flex: 1;
}

.event-type {
  font-weight: bold;
  color: var(--text-primary);
}

.event-user {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.event-time {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.event-metadata {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: var(--bg-primary);
  border-radius: 4px;
  font-size: 0.75rem;
}

.event-metadata pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.loading, .error, .no-events {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
}

.error {
  color: #f44336;
}
</style>
