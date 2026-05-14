<template>
  <div class="phase-progress">
    <div class="phase-item" :class="designStatus">
      <div class="phase-icon">🎨</div>
      <div class="phase-info">
        <span class="phase-name">设计</span>
        <span class="phase-status">{{ statusText(designStatus) }}</span>
      </div>
    </div>
    <div class="phase-connector"></div>
    <div class="phase-item" :class="developmentStatus">
      <div class="phase-icon">💻</div>
      <div class="phase-info">
        <span class="phase-name">开发</span>
        <span class="phase-status">{{ statusText(developmentStatus) }}</span>
      </div>
    </div>
    <div class="phase-connector"></div>
    <div class="phase-item" :class="testingStatus">
      <div class="phase-icon">🧪</div>
      <div class="phase-info">
        <span class="phase-name">测试</span>
        <span class="phase-status">{{ statusText(testingStatus) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  designStatus: {
    type: String,
    default: 'pending'
  },
  developmentStatus: {
    type: String,
    default: 'pending'
  },
  testingStatus: {
    type: String,
    default: 'pending'
  }
})

const statusText = (status) => {
  const statusMap = {
    'pending': '待开始',
    'in_progress': '进行中',
    'completed': '已完成'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.phase-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
}

.phase-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: var(--bg-primary);
  transition: all 0.3s ease;
}

.phase-item.pending {
  background: var(--bg-primary);
  color: var(--text-muted);
}

.phase-item.in_progress {
  background: var(--bg-hover);
  color: var(--accent-color);
  border: 2px solid var(--accent-color);
}

.phase-item.completed {
  background: rgba(76, 175, 80, 0.1);
  color: #388e3c;
  border: 2px solid #4caf50;
}

.phase-icon {
  font-size: 1.5rem;
}

.phase-info {
  display: flex;
  flex-direction: column;
}

.phase-name {
  font-weight: bold;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.phase-status {
  font-size: 0.75rem;
  opacity: 0.8;
}

.phase-connector {
  width: 30px;
  height: 2px;
  background: var(--border-color);
}
</style>