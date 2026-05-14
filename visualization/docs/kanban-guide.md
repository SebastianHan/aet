# 看板功能说明文档

本文档详细介绍项目管理看板的功能、部署方法、配置指南和API参考。

## 目录

1. [概述](#概述)
2. [部署指南](#部署指南)
3. [配置指南](#配置指南)
4. [API参考](#api参考)
5. [常见问题](#常见问题)

---

## 概述

看板（Kanban）是一个可视化的项目管理工具，用于跟踪Issues在整个开发生命周期中的进度。该系统支持多项目Issues跟踪和管理，帮助团队实时了解项目状态。

### 主要功能

- **看板视图**：以可视化方式显示所有Issues的阶段分布
- **Issue详情**：点击Issue查看详细信息和进度
- **项目筛选**：左侧边栏可切换不同项目
- **数据上报**：支持通过API上报各类开发事件

### 阶段说明

看板包含以下七个阶段：

| 阶段ID | 阶段名称 | 中文标签 | 颜色 |
|--------|----------|----------|------|
| 0 | TODO | 待处理 | 灰色 |
| 1 | CLAIMED | 已认领 | 蓝色 |
| 2 | DESIGN | 设计 | 紫色 |
| 3 | DEVELOPMENT | 开发 | 橙色 |
| 4 | TESTING | 测试 | 红色 |
| 5 | PR_SUBMITTED | 提交PR | 青色 |
| 6 | COMPLETED | 已完成 | 绿色 |

---

## 部署指南

### 环境要求

- **后端**：Python 3.8+，Flask
- **前端**：Node.js 16+，npm
- **数据库**：SQLite 3（自动创建）

### 方式一：启动完整服务（推荐）

使用启动脚本同时启动前后端服务：

```bash
cd visualization
./start-dashboard.sh
```

该脚本会自动：
1. 创建Python虚拟环境
2. 安装后端依赖
3. 初始化数据库
4. 启动后端服务（端口5001）
5. 安装前端依赖
6. 启动前端服务（端口5173）

启动完成后访问：
- 前端：http://localhost:5173
- 后端API：http://localhost:5001

### 方式二：分别启动

#### 后端服务

```bash
cd visualization/backend

# 创建虚拟环境（首次）
python3 -m venv venv

# 安装依赖
./venv/bin/pip install -r requirements.txt

# 初始化数据库
./venv/bin/python init_db.py

# 启动服务
PYTHONPATH=. ./venv/bin/python app.py
```

后端地址：http://localhost:5001

#### 前端服务

```bash
cd visualization/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端地址：http://localhost:5173

### 验证服务

服务启动后，可通过以下方式验证：

```bash
curl http://localhost:5001/api/health
```

正常响应：
```json
{
  "success": true,
  "status": "healthy",
  "message": "Dashboard API is running"
}
```

---

## 配置指南

### 配置文件

项目根目录下的 `config.example.json` 是配置模板，复制为 `config.json` 后进行配置：

```bash
cp config.example.json config.json
```

### 配置项说明

```json
{
  "codePlatform": {
    "mode": "issue",
    "platform": {
      "type": "gitcode",
      "upstream": {
        "owner": "your-upstream-owner",
        "repository": "your-repository"
      },
      "token": "your-gitcode-token",
      "apiBaseUrl": "https://gitcode.com/api/v5",
      "fork": {
        "owner": "your-fork-owner",
        "repository": "your-repository"
      },
      "eventReporter": {
        "enabled": true,
        "apiBaseUrl": "http://localhost:5001/api",
        "timeout": 5000
      }
    }
  }
}
```

### 配置项详解

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `platform.type` | 代码平台类型 | `gitcode`、`github` |
| `platform.upstream.owner` | 上游仓库所有者 | `anomalyco` |
| `platform.upstream.repository` | 上游仓库名称 | `agent-dev-team` |
| `platform.token` | 平台API Token | 你的Token |
| `platform.apiBaseUrl` | API基础地址 | `https://gitcode.com/api/v5` |
| `platform.fork.owner` | Fork仓库所有者 | 你的用户名 |
| `platform.fork.repository` | Fork仓库名称 | `agent-dev-team` |
| `platform.eventReporter.enabled` | 是否启用事件上报 | `true` |
| `platform.eventReporter.apiBaseUrl` | 看板API地址 | `http://localhost:5001/api` |
| `platform.eventReporter.timeout` | 请求超时时间(毫秒) | `5000` |

### 数据上传配置

看板支持从外部系统接收Issue事件数据。配置事件上报功能：

1. 确保看板服务已启动
2. 在外部系统的配置中设置 `eventReporter.apiBaseUrl` 为看板API地址
3. 启用 `eventReporter.enabled: true`

---

## API参考

### 基础信息

- 基础URL：`http://localhost:5001/api`
- 响应格式：JSON
- 认证方式：无（开发环境）

### 响应格式

所有API响应采用统一格式：

```json
{
  "success": true,
  "data": { ... },
  "error": "错误信息（失败时）"
}
```

### 常用端点

#### 健康检查

```
GET /api/health
```

响应示例：
```json
{
  "success": true,
  "status": "healthy",
  "message": "Dashboard API is running"
}
```

#### 获取所有项目

```
GET /api/projects
```

响应示例：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "agent-dev-team",
      "created_at": "2024-01-01T00:00:00"
    }
  ]
}
```

#### 获取看板数据

```
GET /api/projects/kanban?project_id=1
```

参数：
- `project_id`（可选）：项目ID，不传则返回所有项目

响应示例：
```json
{
  "success": true,
  "data": {
    "projects": [...],
    "phases": [
      {
        "id": 0,
        "name": "TODO",
        "label": "待处理",
        "color": "#9e9e9e",
        "issues": [...]
      },
      ...
    ]
  }
}
```

#### 获取项目Issues

```
GET /api/projects/:id/issues?page=1&per_page=20&state=open
```

参数：
- `page`：页码（默认1）
- `per_page`：每页数量（默认20）
- `state`：Issue状态（open/closed）

#### 获取项目统计

```
GET /api/projects/:id/stats
```

#### 获取项目阶段统计

```
GET /api/projects/:id/phases/stats
```

### 事件上报

#### 创建事件

```
POST /api/events
Content-Type: application/json
```

请求体：
```json
{
  "project_name": "agent-dev-team",
  "issue_number": 104,
  "event_type": "development_start",
  "user_id": "user123",
  "metadata": {
    "issue_title": "看板功能说明文档",
    "issue_url": "https://gitcode.com/..."
  }
}
```

#### 事件类型

| 事件类型 | 说明 | 触发阶段变化 |
|----------|------|-------------|
| `created` | Issue创建 | - |
| `claimed` | Issue被认领 | 设计状态→pending |
| `design_start` | 开始设计 | 设计状态→in_progress |
| `design_complete` | 设计完成 | 设计状态→completed |
| `development_start` | 开始开发 | 开发状态→in_progress |
| `development_complete` | 开发完成 | 开发状态→completed |
| `testing_start` | 开始测试 | 测试状态→in_progress |
| `testing_complete` | 测试完成 | 测试状态→completed |
| `pr_submitted` | 提交PR | 测试状态→completed |

---

## 常见问题

### Q1: 启动脚本报错"Permission denied"

需要给脚本添加执行权限：

```bash
chmod +x start-dashboard.sh
```

### Q2: 前端端口5173被占用

如果5173端口被占用，前端会自动使用5174端口。可以在 `visualization/frontend/vite.config.js` 中修改端口配置。

### Q3: 数据库初始化失败

确保 `backend/instance` 目录存在且有写入权限：

```bash
mkdir -p backend/instance
```

### Q4: 如何查看数据库内容

可以使用SQLite命令行工具：

```bash
sqlite3 backend/instance/dashboard.db
```

常用命令：
- `.tables` - 查看所有表
- `.schema issue_events` - 查看表结构
- `SELECT * FROM issue_events;` - 查询数据

### Q5: 事件上报后看板没有更新

1. 确认看板服务正常运行：`curl http://localhost:5001/api/health`
2. 检查事件上报配置是否正确
3. 查看后端日志确认是否有错误

### Q6: 如何添加新项目

项目会在首次接收事件时自动创建。也可以通过API直接创建或等待数据上报。

### Q7: 如何清空数据库

删除数据库文件后重新启动：

```bash
rm backend/instance/dashboard.db
./start-dashboard.sh
```

---

## 相关文档

- [项目README](../README.md)
- [后端API源码](../backend/app.py)
- [前端源码](../frontend/)