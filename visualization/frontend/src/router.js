import { createRouter, createWebHistory } from 'vue-router'
import KanbanView from './views/KanbanView.vue'
import ProjectView from './views/ProjectView.vue'
import IssueDetailView from './views/IssueDetailView.vue'
import ArtifactView from './views/ArtifactView.vue'

const routes = [
  { path: '/', component: KanbanView },
  { path: '/overview', component: ProjectView },
  { path: '/issues/:issueId?', component: IssueDetailView },
  { path: '/artifacts', component: ArtifactView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
