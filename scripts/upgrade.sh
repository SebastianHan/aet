#!/bin/bash

# 日志函数
log_info() {
    echo -e "\033[0;34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

log_error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
    exit 1
}

# 依赖检查
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v git >/dev/null 2>&1; then
        log_error "未找到 git，请先安装 git"
    fi
    
    if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
        log_error "未找到 curl 或 wget，请先安装其中之一"
    fi
    
    log_success "依赖检查通过"
}

# 检查是否已安装
check_installed() {
    if [ ! -d "$HOME/.config/opencode/aet" ]; then
        log_error "AET 未安装，请先运行 install.sh"
    fi
    log_success "AET 已安装"
}

# 备份当前版本
backup_current() {
    local backup_dir="$HOME/.config/opencode/aet.backup.$(date +%Y%m%d%H%M%S)"
    
    log_info "备份当前版本..."
    
    # 使用 rsync 避免循环链接问题，或者使用 git 备份
    cd "$HOME/.config/opencode/aet" || log_error "无法进入 AET 目录"
    
    # 创建备份目录
    mkdir -p "$backup_dir" || log_error "无法创建备份目录"
    
    # 复制所有文件和目录，跳过循环链接
    for item in *; do
        if [ "$item" != "." ] && [ "$item" != ".." ]; then
            # 检查是否是循环链接
            if [ -L "$item" ]; then
                local target=$(readlink "$item")
                if echo "$target" | grep -q "$HOME/.config/opencode/aet"; then
                    log_info "跳过循环链接: $item"
                    continue
                fi
            fi
            cp -r "$item" "$backup_dir/" 2>/dev/null || true
        fi
    done
    
    log_success "已备份到 $backup_dir"
}

# 拉取最新代码
pull_latest() {
    log_info "拉取最新代码..."
    
    cd "$HOME/.config/opencode/aet" || log_error "无法进入 AET 目录"
    git fetch origin || log_error "获取远程代码失败"
    git reset --hard origin/main || log_error "重置到最新版本失败"
    
    log_success "代码更新完成"
}

# 恢复配置
restore_config() {
    log_info "更新 skills 目录..."
    
    local aet_dir="$HOME/.config/opencode/aet"
    local aet_skills_dir="$HOME/.config/opencode/skills/aet"
    
    # 删除旧的 skills 目录内容
    rm -rf "$aet_skills_dir"/* || log_error "无法删除旧的 skills 目录内容"
    
    # 复制新的 skills 内容
    cp -r "$aet_dir/skills"/* "$aet_skills_dir/" || log_error "无法复制新的 skills 内容"
    
    log_success "skills 目录更新完成"
}

# 更新commands目录的符号链接
update_commands_symlinks() {
    local aet_dir="$HOME/.config/opencode/aet"
    local commands_dir="$HOME/.config/opencode/commands"
    
    log_info "更新commands目录的符号链接..."
    
    # 创建commands目录
    mkdir -p "$commands_dir" || log_error "无法创建commands目录"
    
    # 删除旧的 AET commands 符号链接
    rm -f "$commands_dir"/aet:*.md 2>/dev/null || true
    
    # 为commands目录中的每个文件创建符号链接
    if [ -d "$aet_dir/commands" ]; then
        for cmd_file in "$aet_dir/commands"/*.md; do
            if [ -f "$cmd_file" ]; then
                local filename=$(basename "$cmd_file")
                local symlink_name="aet:$filename"
                ln -sf "$cmd_file" "$commands_dir/$symlink_name" || \
                    log_error "无法创建符号链接 $symlink_name"
            fi
        done
        log_success "commands符号链接更新完成"
    else
        log_error "commands目录不存在: $aet_dir/commands"
    fi
}

# 验证安装
verify_installation() {
    log_info "验证安装..."
    
    if [ ! -f "$HOME/.config/opencode/plugins/aet.js" ]; then
        log_error "插件链接不存在"
    fi
    
    if [ ! -d "$HOME/.config/opencode/skills/aet" ]; then
        log_error "skills 链接不存在"
    fi
    
    if [ ! -d "$HOME/.config/opencode/commands" ]; then
        log_error "commands目录不存在"
    fi
    
    # 检查至少有一个commands符号链接
    if [ ! -L "$HOME/.config/opencode/commands/aet:init.md" ]; then
        log_error "commands符号链接不存在"
    fi
    
    log_success "安装验证通过"
}

# 验证升级
verify_upgrade() {
    verify_installation
}

# 主函数
main() {
    log_info "开始升级 AET..."
    check_installed
    backup_current
    pull_latest
    restore_config
    update_commands_symlinks
    verify_upgrade
    log_success "AET 升级成功！"
    echo ""
    echo "AET 已升级到最新版本！"
}

main "$@"