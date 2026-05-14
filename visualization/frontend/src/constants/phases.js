export const PHASES = [
  { id: 0, name: 'TODO', label: '待处理', color: '#9e9e9e' },
  { id: 1, name: 'CLAIMED', label: '已认领', color: '#2196f3' },
  { id: 2, name: 'DESIGN', label: '设计', color: '#9c27b0' },
  { id: 3, name: 'DEVELOPMENT', label: '开发', color: '#ff9800' },
  { id: 4, name: 'TESTING', label: '测试', color: '#f44336' },
  { id: 5, name: 'PR_SUBMITTED', label: '提交PR', color: '#00bcd4' },
  { id: 6, name: 'COMPLETED', label: '已完成', color: '#4caf50' }
]

export const PHASE_MAP = {
  'TODO': 0,
  'CLAIMED': 1,
  'DESIGN': 2,
  'DEVELOPMENT': 3,
  'TESTING': 4,
  'PR_SUBMITTED': 5,
  'COMPLETED': 6
}