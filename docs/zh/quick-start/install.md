# AET 安装指南

本文档详细介绍 AET (Agentic Engineering Team) 的安装和升级方法。

## 前置要求

- **Git** - AET 使用 Git 进行版本管理，请确保已安装 Git

验证 Git 已安装：

```bash
git --version
```

## 安装 AET

### 一键安装（推荐）

运行以下命令即可完成安装：

```bash
curl -fsSL https://raw.atomgit.com/leon-wang2021/agent-dev-team/raw/main/scripts/install.sh | bash
```

或使用 wget：

```bash
wget -qO- https://raw.atomgit.com/leon-wang2021/agent-dev-team/raw/main/scripts/install.sh | bash
```

安装脚本会自动完成以下操作：
1. 检查系统依赖
2. 克隆 AET 源代码到 `~/.config/opencode/aet`
3. 创建插件符号链接到 `~/.config/opencode/plugins/aet.js`
4. 创建 skills 目录到 `~/.config/opencode/skills/aet`
5. 创建 commands 符号链接到 `~/.config/opencode/commands/`
6. 验证安装是否成功

### 其他安装方式

#### AI 助手安装

告诉 OpenCode：

```
Fetch and follow instructions from https://raw.atomgit.com/leon-wang2021/agent-dev-team/raw/main/.opencode/INSTALL.md
```

#### 源代码安装（开发模式）

如果你希望使用本地源代码进行开发或调试：

```bash
git clone https://atomgit.com/leon-wang2021/agent-dev-team.git ~/.config/opencode/aet
mkdir -p ~/.config/opencode/plugins
ln -s ~/.config/opencode/aet/.opencode/plugins/aet.js ~/.config/opencode/plugins/aet.js
mkdir -p ~/.config/opencode/skills
ln -s ~/.config/opencode/aet/skills ~/.config/opencode/skills/aet
```

如果你已经在 AET 项目目录下，可以直接运行：

```bash
./scripts/install.sh --local
```

## 安装看板仪表盘（可选）

AET 提供可视化的项目管理看板，用于查看 Issues 的阶段分布和开发进度。

### 前置要求

- **Python 3.x** - 后端服务
- **Node.js** - 前端服务
- **npm** - 前端依赖管理

验证前置要求：

```bash
python3 --version
node --version
npm --version
```

### 一键启动

```bash
cd visualization
./start-dashboard.sh
```

该脚本会：
1. 创建 Python 虚拟环境
2. 安装后端依赖 (Flask)
3. 初始化数据库
4. 启动后端服务 (http://localhost:5001)
5. 安装前端依赖 (Vue)
6. 启动前端服务 (http://localhost:5174)

### 分别启动（可选）

#### 后端

```bash
cd visualization/backend

# 创建虚拟环境（如需要）
python3 -m venv venv

# 安装依赖
./venv/bin/pip install -r requirements.txt

# 初始化数据库
./venv/bin/python init_db.py

# 启动后端
./venv/bin/python app.py
```

#### 前端

```bash
cd visualization/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 访问看板

启动后访问：
- **前端地址**：http://localhost:5174
- **后端地址**：http://localhost:5001

### 看板功能

- **看板视图**：显示所有 Issues 的阶段分布
- **阶段**：TODO → CLAIMED → DESIGN → DEVELOPMENT → TESTING → PR_SUBMITTED → COMPLETED
- **Issue 详情**：点击 Issue 查看详细信息和进度
- **项目筛选**：左侧边栏可切换不同项目

## 升级 AET

### 自动升级（推荐）

运行升级脚本：

```bash
curl -fsSL https://raw.atomgit.com/leon-wang2021/agent-dev-team/raw/main/scripts/upgrade.sh | bash
```

或使用 wget：

```bash
wget -qO- https://raw.atomgit.com/leon-wang2021/agent-dev-team/raw/main/scripts/upgrade.sh | bash
```

升级脚本会自动完成以下操作：
1. 检查 AET 是否已安装
2. 备份当前版本到 `~/.config/opencode/aet.backup.{timestamp}`
3. 拉取最新代码
4. 更新 skills 目录
5. 更新 commands 符号链接
6. 验证升级是否成功

### 手动升级

如果你通过源代码方式安装，可以手动拉取最新代码：

```bash
cd ~/.config/opencode/aet
git fetch origin
git reset --hard origin/main

# 更新 skills 目录
rm -rf ~/.config/opencode/skills/aet/*
cp -r ~/.config/opencode/aet/skills/* ~/.config/opencode/skills/aet/

# 更新 commands 符号链接
rm -f ~/.config/opencode/commands/aet:*.md
for cmd_file in ~/.config/opencode/aet/commands/*.md; do
    filename=$(basename "$cmd_file")
    ln -sf "$cmd_file" ~/.config/opencode/commands/aet:$filename"
done
```

## 验证安装

安装或升级完成后，可以通过以下方式验证：

```bash
# 检查插件目录
ls -la ~/.config/opencode/plugins/aet.js

# 检查 skills 目录
ls -la ~/.config/opencode/skills/aet

# 检查 commands 目录
ls -la ~/.config/opencode/commands/aet:*.md
```

## 卸载 AET

如果你需要卸载 AET：

```bash
# 删除 AET 目录
rm -rf ~/.config/opencode/aet

# 删除插件符号链接
rm -f ~/.config/opencode/plugins/aet.js

# 删除 skills 目录
rm -rf ~/.config/opencode/skills/aet

# 删除 commands 符号链接
rm -f ~/.config/opencode/commands/aet:*.md
```

## 常见问题

### 安装失败：未找到 git

请先安装 Git：
- macOS: `brew install git`
- Ubuntu/Debian: `sudo apt-get install git`
- Windows: 下载安装 [Git for Windows](https://gitforwindows.org/)

### 升级失败：AET 未安装

请先运行安装命令进行安装。

### 无法找到插件

确保 OpenCode 配置目录存在且正确：

```bash
ls -la ~/.config/opencode/
```

如果配置文件不存在，可能需要先初始化 OpenCode。
