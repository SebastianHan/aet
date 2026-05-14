<template>
  <div class="artifact-view">
    <div class="artifact-header">
      <div class="header-left">
        <router-link to="/" class="back-btn">← 返回看板</router-link>
        <div class="section-title">📦 PRD文件查看器</div>
      </div>
      <div class="path-input-group">
        <div class="custom-select" :class="{ open: dropdownOpen }">
          <div class="select-trigger" @click="dropdownOpen = !dropdownOpen">
            <span class="select-text">{{ selectedProject?.name || '选择项目' }}</span>
            <span class="select-arrow">▼</span>
          </div>
          <div v-if="dropdownOpen" class="select-dropdown">
            <div
              v-for="p in projects"
              :key="p.id"
              class="select-item"
              :class="{ selected: p.id === selectedProjectId }"
              @click="selectProject(p)"
            >
              <span class="item-name">{{ p.name }}</span>
              <button
                v-if="!p.is_default"
                class="item-delete-btn"
                @click.stop="deleteProject(p)"
                title="删除项目"
              >×</button>
            </div>
            <div v-if="projects.length === 0" class="select-empty">暂无项目</div>
          </div>
        </div>
        <button class="action-btn" @click="loadArtifacts" :disabled="loading">
          {{ loading ? '加载中...' : '加载' }}
        </button>
      </div>
      <div class="artifact-actions">
        <button class="action-btn" @click="loadArtifacts" title="刷新">↻</button>
        <button class="action-btn" @click="toggleFullscreen" title="全屏">
          {{ isFullscreen ? '📥' : '📤' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="delete-modal" @click.self="cancelDelete">
      <div class="delete-modal-content">
        <div class="delete-modal-header">确认删除</div>
        <div class="delete-modal-body">
          确认删除项目 "{{ projectToDelete?.name || selectedProject?.name }}"？此操作仅删除数据库记录，不删除原始文件。
        </div>
        <div class="delete-modal-footer">
          <button class="modal-btn cancel-btn" @click="cancelDelete">取消</button>
          <button class="modal-btn confirm-btn" @click="doDelete">确认删除</button>
        </div>
      </div>
    </div>

    <div v-if="projectName" class="artifact-content">
      <div class="artifact-split">
        <div class="stage-col">
          <div class="stage-flow">
            <button
              v-for="stage in stageEntries"
              :key="stage.id"
              class="stage-node"
              :class="{ active: selectedStageId === stage.id }"
              @click="selectStage(stage.id)"
            >
              <span class="stage-dot"></span>
              <span class="stage-label">{{ stage.label }}</span>
            </button>
          </div>
        </div>

        <div class="preview-col">
          <div class="preview-head">
            <div class="file-tabs">
              <template v-if="selectedStageId === 'features'">
                <span class="tab-label">特性列表</span>
              </template>
              <template v-else>
                <button
                  v-for="file in currentStageFiles"
                  :key="file"
                  class="file-tab-btn"
                  :class="{ active: selectedFile === file }"
                  @click="selectFile(file)"
                >
                  {{ getDisplayName(file) }}
                </button>
                <span v-if="currentStageFiles.length === 0" class="hint">该阶段无文件</span>
              </template>
            </div>
          </div>

          <div class="preview-viewport">
<!-- Feature Cards View -->
            <template v-if="selectedStageId === 'features'">
              <div class="features-kanban">
                <div
                  v-for="group in FEATURE_GROUPS"
                  :key="group.id"
                  class="feature-column"
                >
                  <div class="feature-column-header" :style="{ borderTopColor: group.color }">
                    <span class="feature-column-name">{{ group.label }}</span>
                    <span class="feature-column-count">{{ getFeaturesByGroup(group.id).length }}</span>
                  </div>
                  <div class="feature-column-content">
                    <div
                      v-for="feature in getFeaturesByGroup(group.id)"
                      :key="feature.id"
                      class="feature-card"
                      @click="viewFeature(feature)"
                    >
                      <div class="feature-card-header">
                        <span class="feature-id">
                          {{ feature.id }}
                          <a 
                            v-if="feature.issue_url" 
                            class="feature-issue-link-inline"
                            :href="feature.issue_url" 
                            target="_blank"
                            @click.stop
                          >
                            (#{{ feature.linked_issue }})
                          </a>
                          <span v-else-if="feature.linked_issue" class="feature-issue-inline">(#{{ feature.linked_issue }})</span>
                        </span>
                        <span class="feature-priority" :class="feature.priority">{{ feature.priority }}</span>
                      </div>
                      <div class="feature-name">{{ feature.name }}</div>
                      <div class="feature-version">版本: {{ feature.version }}</div>
                    </div>
                    <div v-if="getFeaturesByGroup(group.id).length === 0" class="empty-feature">
                      暂无
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div v-if="loadingArtifact" class="loading-state">加载中...</div>
              <div v-else-if="!selectedFile" class="empty-state">请选择一个文件查看</div>
              <div v-else-if="isHtmlFile(selectedFile)" class="html-preview">
                <iframe :src="'/api/artifacts/preview?path=' + encodeURIComponent(projectPath) + '&file=' + encodeURIComponent(selectedFile)" frameborder="0"></iframe>
              </div>
              <template v-else-if="artifactContent">
                <div v-if="artifactContent.type === 'markdown'" class="markdown-body" v-html="renderedMarkdown"></div>
                <pre v-else-if="artifactContent.type === 'json'" class="json-body">{{ JSON.stringify(artifactContent.content, null, 2) }}</pre>
                <pre v-else class="text-body">{{ artifactContent.content }}</pre>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="artifact-empty-state">
      <div class="empty-icon">📦</div>
      <div class="empty-text">请输入项目路径加载PRD文件</div>
    </div>

    <div v-if="isFullscreen && (artifactContent || isHtmlFile(selectedFile))" class="fullscreen-modal" @click="toggleFullscreen">
      <div class="fullscreen-content" @click.stop>
        <div class="fullscreen-header">
          <span>{{ selectedFile }}</span>
          <button class="close-btn" @click="toggleFullscreen">✕</button>
        </div>
        <iframe v-if="isHtmlFile(selectedFile)" :src="'/api/artifacts/preview?path=' + encodeURIComponent(projectPath) + '&file=' + encodeURIComponent(selectedFile)" class="fullscreen-iframe"></iframe>
        <div v-else-if="artifactContent && artifactContent.type === 'markdown'" class="fullscreen-body markdown-body" v-html="renderedMarkdown"></div>
      </div>
    </div>

    <!-- Feature Preview Modal -->
    <div v-if="showFeatureModal" class="fullscreen-modal" @click="closeFeatureModal">
      <div class="fullscreen-content" @click.stop>
        <div class="fullscreen-header">
          <span>{{ selectedFeature?.name }}</span>
          <button class="close-btn" @click="closeFeatureModal">✕</button>
        </div>
        <div v-if="loadingFeature" class="loading-state">加载中...</div>
        <div v-else-if="featureContent" class="fullscreen-body markdown-body" v-html="renderedFeatureMarkdown"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import apiClient from '../api/client.js'

const projectPath = ref('')
const projectName = ref('')
const loading = ref(false)
const error = ref(null)
const artifactTree = ref([])
const artifactFilesFlat = ref([])
const selectedStageId = ref('')
const selectedFile = ref('')
const artifactContent = ref(null)
const loadingArtifact = ref(false)
const isFullscreen = ref(false)
const contentCache = new Map()
const CACHE_MAX_SIZE = 80

// Project selection state
const projects = ref([])
const selectedProjectId = ref('')
const selectedProject = ref(null)
const showDeleteModal = ref(false)
const dropdownOpen = ref(false)
const projectToDelete = ref(null)

const canDeleteSelected = computed(() => {
  const proj = projects.value.find(p => p.id === selectedProjectId.value)
  return proj && !proj.is_default
})

// Feature-specific state
const allFeatures = ref([])
const showFeatureModal = ref(false)
const selectedFeature = ref(null)
const featureContent = ref(null)
const loadingFeature = ref(false)
const featureCache = new Map()

const STAGE_FLOW = [
  { id: 'product-analysis', label: '01 产品分析' },
  { id: 'competitor-research', label: '02 竞品调研' },
  { id: 'innovation-analysis', label: '03 创新分析' },
  { id: 'requirements-document', label: '04 需求文档' },
  { id: 'prototype', label: '05 原型实现' },
  { id: 'final-review', label: '06 最终评审' },
  { id: 'deliverables', label: 'A1 产品文档' },
  { id: 'features', label: 'A2 特性列表' },
]

const FEATURE_GROUPS = [
  { id: 'new_pending', label: '新特性（待处理）', color: '#ff9800' },
  { id: 'new_processed', label: '新特性（已处理）', color: '#2196f3' },
  { id: 'implemented', label: '已实现特性', color: '#4caf50' },
]

const STAGE_PREFIXES = {
  'product-analysis': ['docs/01-', 'structured/01-', 'review/01-'],
  'competitor-research': ['docs/02-', 'structured/02-', 'review/02-'],
  'innovation-analysis': ['docs/03-', 'structured/03-', 'review/03-'],
  'requirements-document': ['docs/04-', 'structured/04-', 'review/04-'],
  'prototype': ['docs/05-'],
  'final-review': ['review/final-review'],
  'deliverables': ['reports/'],
}

const loadArtifacts = async () => {
  if (!projectPath.value) return
  loading.value = true
  error.value = null
  selectedStageId.value = ''
  selectedFile.value = null
  artifactContent.value = null
  try {
    const resp = await apiClient.get('/artifacts', { params: { path: projectPath.value.trim() || undefined } })
    if (resp.data.success) {
      projectPath.value = resp.data.data.projectPath || projectPath.value
      projectName.value = resp.data.data.projectName
      artifactTree.value = resp.data.data.tree
      artifactFilesFlat.value = flattenTree(resp.data.data.tree)
      contentCache.clear()
      const first = STAGE_FLOW[0]
      selectStage(first.id)
    } else {
      error.value = resp.data.error || '加载失败'
    }
  } catch (e) {
    error.value = e.response?.data?.error || '加载失败'
  } finally {
    loading.value = false
  }
}

const loadProjects = async () => {
  try {
    const resp = await apiClient.get('/prd-projects')
    if (resp.data.success) {
      projects.value = resp.data.data.projects
      const defaultPath = resp.data.data.default_path
      if (defaultPath && projects.value.length > 0) {
        const defaultProj = projects.value.find(p => p.is_default)
        if (defaultProj) {
          selectedProjectId.value = defaultProj.id
          selectedProject.value = defaultProj
          projectPath.value = defaultProj.path
        }
      }
    }
  } catch (e) {
    console.error('Failed to load projects:', e)
  }
}

const onProjectChange = () => {
  const proj = projects.value.find(p => p.id === selectedProjectId.value)
  if (proj) {
    selectedProject.value = proj
    projectPath.value = proj.path
    loadArtifacts()
  }
}

const selectProject = (proj) => {
  selectedProjectId.value = proj.id
  selectedProject.value = proj
  projectPath.value = proj.path
  dropdownOpen.value = false
  loadArtifacts()
}

const deleteProject = (proj) => {
  projectToDelete.value = proj
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (!canDeleteSelected.value) return
  projectToDelete.value = projects.value.find(p => p.id === selectedProjectId.value)
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  projectToDelete.value = null
}

const doDelete = async () => {
  const targetId = projectToDelete.value?.id || selectedProjectId.value
  if (!targetId) return
  try {
    const resp = await apiClient.delete(`/prd-projects/${targetId}`)
    if (resp.data.success) {
      await loadProjects()
      if (projects.value.length > 0) {
        const defaultProj = projects.value.find(p => p.is_default) || projects.value[0]
        selectedProjectId.value = defaultProj.id
        selectedProject.value = defaultProj
        projectPath.value = defaultProj.path
        loadArtifacts()
      }
    }
  } catch (e) {
    error.value = e.response?.data?.error || '删除失败'
  } finally {
    showDeleteModal.value = false
    projectToDelete.value = null
  }
}

onMounted(async () => {
  await loadProjects()
  if (projectPath.value) {
    await loadArtifacts()
  }
  // 点击外部关闭下拉
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (e) => {
  const selectEl = document.querySelector('.custom-select')
  if (selectEl && !selectEl.contains(e.target)) {
    dropdownOpen.value = false
  }
}

watch(artifactContent, async () => {
  await nextTick()
  if (artifactContent.value?.type === 'markdown' && window.mermaid) {
    const els = document.querySelectorAll('.markdown-body .mermaid')
    if (els.length > 0) {
      try {
        window.mermaid.init({ startOnLoad: false, theme: 'default' }, els)
      } catch (e) {
        console.error('Mermaid init error:', e, 'els:', els.length)
      }
    }
  }
})

watch(featureContent, async () => {
  await nextTick()
  if (featureContent.value?.type === 'markdown' && window.mermaid) {
    const els = document.querySelectorAll('.fullscreen-body .mermaid')
    if (els.length > 0) {
      try {
        window.mermaid.init({ startOnLoad: false, theme: 'default' }, els)
      } catch (e) {
        console.error('Mermaid init error in feature modal:', e, 'els:', els.length)
      }
    }
  }
})

const flattenTree = (tree) => {
  const result = []
  for (const item of tree) {
    if (item.type === 'file') result.push(item)
    else if (item.children) result.push(...flattenTree(item.children))
  }
  return result
}

const stageEntries = computed(() => {
  return STAGE_FLOW.map(stage => {
    const files = listStageFiles(stage.id)
    return { id: stage.id, label: stage.label, files }
  })
})

const listStageFiles = (stageId) => {
  const prefixes = STAGE_PREFIXES[stageId]
  if (!prefixes) return []
  return artifactFilesFlat.value
    .filter(f => {
      const lower = f.path.toLowerCase()
      if (!prefixes.some(p => lower.startsWith(p.toLowerCase()))) return false
      if (lower.endsWith('.json') || lower.endsWith('.js') || lower.endsWith('.css')) return false
      return true
    })
    .map(f => f.path)
    .sort()
}

const currentStageFiles = computed(() => {
  if (!selectedStageId.value) return []
  if (selectedStageId.value === 'features') return []
  return listStageFiles(selectedStageId.value)
})

const selectStage = (stageId) => {
  selectedStageId.value = stageId
  selectedFile.value = null
  artifactContent.value = null
  if (stageId === 'features') {
    fetchFeatures()
  } else {
    const files = listStageFiles(stageId)
    if (files.length > 0) {
      selectFile(files[0])
    }
  }
}

const selectFile = async (file) => {
  selectedFile.value = file
  artifactContent.value = null
  const cacheKey = projectPath.value + '::' + file
  const cached = contentCache.get(cacheKey)
  if (cached) {
    artifactContent.value = cached
    return
  }
  loadingArtifact.value = true
  try {
    const lower = file.toLowerCase()
    const endpoint = lower.endsWith('.md') ? '/artifacts/markdown' : '/artifacts/read'
    const resp = await apiClient.get(endpoint, { params: { path: projectPath.value, file } })
    if (resp.data.success) {
      artifactContent.value = resp.data.data
      if (contentCache.size >= CACHE_MAX_SIZE) {
        const firstKey = contentCache.keys().next().value
        contentCache.delete(firstKey)
      }
      contentCache.set(cacheKey, resp.data.data)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingArtifact.value = false
  }
}

const toggleFullscreen = () => { isFullscreen.value = !isFullscreen.value }

const getDisplayName = (path) => {
  const parts = path.split('/')
  const name = parts[parts.length - 1]
  return name.replace(/\.(md|html?|txt)$/i, '').replace(/[_-]/g, ' ')
}

const isHtmlFile = (path) => {
  if (!path) return false
  const lower = path.toLowerCase()
  return lower.endsWith('.html') || lower.endsWith('.htm')
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const applyInline = (text) => {
  let r = text
  r = r.replace(/&lt;(\w+)&gt;/g, (_, tag) => `<${tag}>`)
  r = r.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  r = r.replace(/\*(.+?)\*/g, '<em>$1</em>')
  r = r.replace(/`([^`]+)`/g, '<code>$1</code>')
  r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
  return r
}

const renderMarkdown = (md) => {
  const lines = String(md || '').replace(/\r/g, '').split('\n')
  const out = []
  let listType = ''
  let inQuote = false
  const closeList = () => {
    if (listType) {
      out.push('</' + listType + '>')
      listType = ''
    }
  }
  const closeQuote = () => {
    if (inQuote) {
      out.push('</blockquote>')
      inQuote = false
    }
  }
  const splitTableRow = (line) => {
    const cleaned = String(line || '').trim().replace(/^\|/, '').replace(/\|$/, '')
    return cleaned.split('|').map((cell) => applyInline(cell.trim()))
  }
  const isTableSeparator = (line) => {
    const cleaned = String(line || '').trim().replace(/^\|/, '').replace(/\|$/, '')
    if (!cleaned) return false
    return cleaned.split('|').every((part) => /^\s*:?-{3,}:?\s*$/.test(part))
  }
  let inCodeBlock = false
  let codeLang = ''
  let isMermaid = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // 处理代码块开始 ```lang
    if (line.startsWith('```') && !inCodeBlock) {
      closeList()
      closeQuote()
      inCodeBlock = true
      const langMatch = line.match(/^```(\w*)/)
      codeLang = langMatch ? langMatch[1] : ''
      isMermaid = codeLang === 'mermaid'
      if (isMermaid) {
        out.push('<pre class="mermaid">')
      } else {
        const langClass = codeLang ? ` class="language-${codeLang}"` : ''
        out.push(`<pre><code${langClass}>`)
      }
      continue
    }
    // 处理代码块结束
    if (line.startsWith('```') && inCodeBlock) {
      closeList()
      closeQuote()
      if (isMermaid) {
        out.push('</pre>')
      } else {
        out.push('</code></pre>')
      }
      inCodeBlock = false
      isMermaid = false
      codeLang = ''
      continue
    }
    if (inCodeBlock) {
      out.push((isMermaid ? line : escapeHtml(line)) + '\n')
      continue
    }
    if (!line.trim()) {
      closeList()
      closeQuote()
      continue
    }
    const hMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (hMatch) {
      closeList()
      closeQuote()
      const lv = hMatch[1].length
      out.push('<h' + lv + '>' + applyInline(hMatch[2].trim()) + '</h' + lv + '>')
      continue
    }
    if (/^[-*_]{3,}\s*$/.test(line)) {
      closeList()
      closeQuote()
      out.push('<hr />')
      continue
    }
    if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      closeList()
      closeQuote()
      const headerCells = splitTableRow(line)
      const bodyRows = []
      i += 2
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
        bodyRows.push(splitTableRow(lines[i]))
        i += 1
      }
      out.push('<table border="1"><thead><tr>' + headerCells.map((c) => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' +
        bodyRows.map((row) => '<tr>' + row.map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('') +
        '</tbody></table>')
      continue
    }
    if (line.trim().startsWith('>')) {
      closeList()
      if (!inQuote) {
        inQuote = true
        out.push('<blockquote>')
      }
      out.push('<p>' + applyInline(line.slice(1).trim()) + '</p>')
      continue
    } else {
      closeQuote()
    }
    if (/^\s*[-*]\s/.test(line)) {
      if (listType !== 'ul') {
        closeList()
        listType = 'ul'
        out.push('<ul>')
      }
      out.push('<li>' + applyInline(line.replace(/^\s*[-*]\s+/, '')) + '</li>')
      continue
    }
    if (/^\d+\.\s+/.test(line)) {
      if (listType !== 'ol') {
        closeList()
        listType = 'ol'
        out.push('<ol>')
      }
      out.push('<li>' + applyInline(line.replace(/^\d+\.\s+/, '')) + '</li>')
      continue
    }
    closeList()
    out.push('<p>' + applyInline(line) + '</p>')
  }
  closeList()
  closeQuote()
  return out.join('')
}

const renderedMarkdown = computed(() => {
  if (artifactContent.value && artifactContent.value.type === 'markdown') {
    return renderMarkdown(artifactContent.value.content)
  }
  return ''
})

const renderedFeatureMarkdown = computed(() => {
  if (featureContent.value && featureContent.value.type === 'markdown') {
    return renderMarkdown(featureContent.value.content)
  }
  return ''
})

const getFeaturesByGroup = (groupId) => {
  const features = allFeatures.value || []
  
  if (groupId === 'new_pending') {
    // 新特性（待处理）：未完成 且 无关联 issue
    return features.filter(f => 
      f.status !== 'completed' && !f.linked_issue
    )
  } else if (groupId === 'new_processed') {
    // 新特性（已处理）：未完成 且 有关联 issue
    return features.filter(f => 
      f.status !== 'completed' && f.linked_issue
    )
  } else if (groupId === 'implemented') {
    // 已实现特性：已完成
    return features.filter(f => f.status === 'completed')
  }
  
  return []
}

const fetchFeatures = async () => {
  try {
    const resp = await apiClient.get('/artifacts/features', {
      params: { path: projectPath.value }
    })
    if (resp.data.success) {
      allFeatures.value = resp.data.data.features || []
    }
  } catch (e) {
    console.error('Error fetching features:', e)
  }
}

const viewFeature = async (feature) => {
  selectedFeature.value = feature
  featureContent.value = null
  showFeatureModal.value = true

  const cacheKey = projectPath.value + '::' + feature.path
  const cached = featureCache.get(cacheKey)
  if (cached) {
    featureContent.value = cached
    return
  }

  loadingFeature.value = true
  try {
    const resp = await apiClient.get('/artifacts/markdown', {
      params: { path: projectPath.value, file: feature.path }
    })
    if (resp.data.success) {
      featureContent.value = resp.data.data
      featureCache.set(cacheKey, resp.data.data)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingFeature.value = false
  }
}

const closeFeatureModal = () => {
  showFeatureModal.value = false
  selectedFeature.value = null
  featureContent.value = null
}
</script>

<style scoped>
.artifact-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}
.artifact-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.back-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  text-decoration: none;
  font-size: 13px;
}
.back-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }
.section-title { font-weight: 600; font-size: 15px; white-space: nowrap; color: var(--text-primary); }
.path-input-group { display: flex; gap: 8px; flex: 1; max-width: 400px; }
.custom-select {
  flex: 1;
  position: relative;
  font-size: 13px;
}
.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s;
}
.select-trigger:hover { border-color: var(--accent-color); }
.custom-select.open .select-trigger { border-color: var(--accent-color); }
.select-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.select-arrow { font-size: 10px; color: var(--text-muted); margin-left: 8px; }
.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 280px;
  overflow-y: auto;
}
.select-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border-color);
}
.select-item:last-child { border-bottom: none; }
.select-item:hover { background: var(--bg-hover); }
.select-item.selected { background: var(--bg-hover); color: var(--accent-color); }
.item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-delete-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  margin-left: 8px;
  opacity: 0.5;
  transition: all 0.15s;
}
.item-delete-btn:hover { color: #dc2626; opacity: 1; }
.select-empty {
  padding: 12px;
  color: var(--text-muted);
  text-align: center;
  font-size: 13px;
}
.path-select {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  background: var(--bg-input);
  color: var(--text-primary);
  cursor: pointer;
}
.path-select:focus { outline: none; border-color: var(--accent-color); }
.path-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  background: var(--bg-input);
  color: var(--text-primary);
}
.path-input:focus { outline: none; border-color: var(--accent-color); }
.action-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-white);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
}
.action-btn:hover:not(:disabled) { border-color: var(--accent-color); background: var(--bg-hover); }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.artifact-actions { display: flex; gap: 8px; }
.error-message { padding: 12px 16px; background: #fef2f2; color: #dc2626; font-size: 13px; }
.artifact-content { flex: 1; min-height: 0; overflow: hidden; }
.artifact-split {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
  padding: 16px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
.stage-col {
  background: var(--bg-white);
  border-radius: 10px;
  padding: 12px;
  overflow-y: auto;
  min-height: 0;
  height: 100%;
}
.stage-flow { display: flex; flex-direction: column; gap: 4px; }
.stage-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  color: var(--text-primary);
  transition: all 0.15s;
}
.stage-node:hover { border-color: rgba(33, 150, 243, 0.25); background: var(--bg-hover); }
.stage-node.active { border-color: var(--accent-color); background: var(--bg-hover); color: var(--accent-color); font-weight: 500; }
.stage-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); flex-shrink: 0; }
.stage-node.active .stage-dot { background: var(--accent-color); }
.stage-label { flex: 1; }
.preview-col {
  background: var(--bg-white);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}
.preview-head {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  gap: 8px;
  flex-shrink: 0;
}
.file-tabs { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.tab-label { font-size: 13px; color: var(--text-secondary); }
.file-tab-btn {
  padding: 4px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}
.file-tab-btn:hover { border-color: var(--accent-color); color: var(--text-primary); }
.file-tab-btn.active { border-color: var(--accent-color); background: var(--bg-hover); color: var(--accent-color); }
.hint { font-size: 12px; color: var(--text-muted); padding: 4px 8px; }
.preview-viewport { flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
.loading-state, .empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  color: var(--text-muted);
  font-size: 13px;
}
.markdown-body :deep(table) { width: 100%; border-collapse: collapse; margin: 1rem 0; border: 1px solid var(--border-color); }
.markdown-body :deep(th) { background: var(--bg-primary); border: 1px solid var(--border-color); padding: 8px 12px; text-align: left; font-weight: 600; }
.markdown-body :deep(tr:nth-child(even)) { background: var(--bg-primary); }
.markdown-body :deep(blockquote) { border-left: 4px solid var(--accent-color); background: var(--bg-primary); margin: 1rem 0; padding: 0.5rem 1rem; border-top-right-radius: 6px; border-bottom-right-radius: 6px; }
.markdown-body :deep(pre) { background: var(--bg-primary); padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; }
.markdown-body :deep(pre code) { background: none; padding: 0; }
.markdown-body :deep(a) { color: var(--accent-color); }
.markdown-body :deep(ul), .markdown-body :deep(ol) { margin: 0.75rem 0; padding-left: 1.5rem; }
.markdown-body :deep(li) { margin: 0.25rem 0; }
.markdown-body :deep(h1) { font-size: 1.5rem; margin: 1.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); display: block; color: var(--text-primary); }
.markdown-body :deep(h2) { font-size: 1.25rem; margin: 1.25rem 0 0.75rem; display: block; color: var(--text-primary); }
.markdown-body :deep(h3) { font-size: 1.1rem; margin: 1rem 0 0.5rem; display: block; color: var(--text-primary); }
.markdown-body :deep(p) { margin: 0.75rem 0; color: var(--text-primary); }
.markdown-body :deep(hr) { border-top: 1px solid var(--border-color); margin: 1rem 0; display: block; }
.markdown-body :deep(.mermaid) { margin: 1rem 0; }
.markdown-body :deep(.mermaid svg) { max-width: 100%; height: auto; }
.markdown-body { flex: 1; min-height: 0; overflow: auto; padding: 16px; line-height: 1.7; font-size: 14px; color: var(--text-primary); }
.json-body, .text-body { flex: 1; min-height: 0; overflow: auto; margin: 0; padding: 16px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-all; color: var(--text-primary); }
.html-preview { flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
.html-preview iframe { flex: 1; min-height: 0; width: 100%; border: none; display: block; }
.fullscreen-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 350; margin: 10px; border-radius: 14px; overflow: hidden; }
.fullscreen-content { background: var(--bg-white); width: calc(100% - 20px); height: calc(100% - 20px); border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; }
.fullscreen-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-weight: 600; flex-shrink: 0; color: var(--text-primary); }
.fullscreen-body { flex: 1; min-height: 0; overflow: auto; padding: 16px; }
.fullscreen-iframe { flex: 1; min-height: 0; width: 100%; border: none; display: block; }
.close-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--text-muted); padding: 4px 8px; }
.close-btn:hover { color: var(--text-primary); }
@media (max-width: 768px) {
  .artifact-split { grid-template-columns: 1fr; }
  .stage-col { max-height: 150px; }
}

/* Features Kanban */
.features-kanban {
  display: flex;
  gap: 12px;
  padding: 16px;
  height: 100%;
  overflow-x: auto;
}

.feature-column {
  flex: 1;
  min-width: 180px;
  max-width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
}

.feature-column-header {
  padding: 10px 12px;
  background: var(--bg-white);
  border-top: 4px solid #9e9e9e;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feature-column-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
}

.feature-column-count {
  background: var(--bg-primary);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: var(--text-secondary);
}

.feature-column-content {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-card {
  background: var(--bg-card);
  border-radius: 6px;
  padding: 10px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.feature-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.feature-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.feature-id {
  font-weight: 600;
  font-size: 12px;
  color: var(--text-secondary);
}

.feature-issue-inline {
  font-size: 11px;
  color: var(--text-muted);
}

.feature-issue-link-inline {
  font-size: 11px;
  color: var(--accent-color);
  text-decoration: none;
  cursor: pointer;
}

.feature-issue-link-inline:hover {
  text-decoration: underline;
}

.feature-priority {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 6px;
  text-transform: uppercase;
}

.feature-priority.high { background: #f44336; color: white; }
.feature-priority.medium { background: #ff9800; color: white; }
.feature-priority.low { background: #9e9e9e; color: white; }

.feature-name {
  font-size: 13px;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feature-version {
  font-size: 11px;
  color: var(--text-muted);
}

.empty-feature {
  text-align: center;
  color: var(--text-muted);
  padding: 20px 0;
  font-size: 12px;
}

/* Delete Modal */
.delete-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
}
.delete-modal-content {
  background: var(--bg-white);
  border-radius: 12px;
  width: 360px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.delete-modal-header {
  padding: 16px 20px;
  font-weight: 600;
  font-size: 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}
.delete-modal-body {
  padding: 20px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.delete-modal-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border-color);
}
.modal-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--border-color);
}
.cancel-btn {
  background: var(--bg-white);
  color: var(--text-primary);
}
.cancel-btn:hover { background: var(--bg-hover); }
.confirm-btn {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}
.confirm-btn:hover { background: #b91c1c; }
</style>
