# AET 快速安装/升级脚本

## 说明

这些脚本已经将所有必要的函数内联到单个文件中，因此可以独立运行而无需其他依赖文件。

**重要变更**：
- skills 目录现在使用真实目录而不是符号链接
- 避免了循环链接问题
- 升级时会自动更新 skills 目录内容

## 安装

### 使用 curl

```bash
curl -fsSL https://raw.atomgit.com/leon-wang2021/agent-dev-team/raw/main/scripts/install.sh | bash
```

### 使用 wget

```bash
wget -qO- https://raw.atomgit.com/leon-wang2021/agent-dev-team/raw/main/scripts/install.sh | bash
```

### 手动安装

下载脚本后手动执行：

```bash
chmod +x install.sh
./install.sh
```

## 升级

### 使用 curl

```bash
curl -fsSL https://raw.atomgit.com/leon-wang2021/agent-dev-team/main/scripts/upgrade.sh | bash
```

### 使用 wget

```bash
wget -qO- https://raw.atomgit.com/leon-wang2021/agent-dev-team/main/scripts/upgrade.sh | bash
```

### 手动升级

下载脚本后手动执行：

```bash
chmod +x upgrade.sh
./upgrade.sh
```

## 支持的平台

- Linux
- macOS
- Windows WSL

## 系统要求

- Git
- curl 或 wget
- Bash

## 安装位置

默认安装到 `~/.config/opencode/aet`

## 故障排除

### 权限错误

如果遇到权限错误，请确保您有写入 `~/.config/opencode/` 的权限。

### 网络错误

如果下载失败，请检查网络连接或手动克隆仓库：

```bash
git clone https://atomgit.com/leon-wang2021/agent-dev-team.git ~/.config/opencode/aet
```

### 符号链接错误

如果符号链接创建失败，请检查目标目录是否存在并具有写入权限。