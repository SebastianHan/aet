# Project Lifecycle Dashboard

可视化项目管理看板，支持多项目Issues跟踪和管理。

## 文档

- [看板功能说明文档](./docs/kanban-guide.md) - 详细的部署、配置和API参考

## 快速启动

### 方式一：启动全部服务（前后端）

```bash
cd visualization
./start-dashboard.sh
```

### 方式二：分别启动

#### 后端

```bash
cd visualization/backend
PYTHONPATH=. python app.py
```

后端地址: http://localhost:5001

#### 前端

```bash
cd visualization/frontend
npm run dev
```

前端地址: http://localhost:5173

## 功能说明

- **看板视图**: 显示所有Issues的阶段分布（待处理→已认领→设计→开发→测试→提交PR→已完成）
- **Issue详情**: 点击Issue查看详细信息和进度
- **项目筛选**: 左侧边栏可切换不同项目

## API端点

- `GET /api/projects` - 获取所有项目
- `GET /api/projects/kanban` - 获取看板数据
- `GET /api/projects/:id/issues` - 获取项目的Issues
- `POST /api/events` - 上报事件（创建/认领/提交PR等）

## 数据库

- 首次启动时自动创建SQLite数据库
- 数据库文件位于 `backend/instance/dashboard.db`