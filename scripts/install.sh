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

# 检测管道模式
IS_PIPE_MODE=false
if [ ! -t 0 ]; then
    IS_PIPE_MODE=true
fi

# 安全读取用户输入（管道模式下从 /dev/tty 读取）
safe_read() {
    local prompt="$1"
    local var_name="$2"

    if [ "$IS_PIPE_MODE" = true ]; then
        # 管道模式：从 /dev/tty 读取
        echo -n "$prompt"
        read "$var_name" < /dev/tty
    else
        # 正常模式：从 stdin 读取
        read -p "$prompt" "$var_name"
    fi
}

# 依赖检查
check_dependencies() {
    log_info "检查依赖..."

    if ! command -v git >/dev/null 2>&1; then
        log_error "未找到 git，请先安装 git"
    fi

    if ! command -v node >/dev/null 2>&1; then
        log_error "未找到 Node.js，请先安装 Node.js\n       AET 插件需要 Node.js 才能运行"
    fi

    if ! command -v npm >/dev/null 2>&1; then
        log_error "未找到 npm，请先安装 Node.js（npm 会随 Node.js 安装）"
    fi

    log_success "依赖检查通过"
}

# 安装 npm 依赖（包括 @opencode-ai/plugin）
install_dependencies() {
    local aet_dir="$HOME/.config/opencode/aet"

    log_info "安装 npm 依赖（包括 @opencode-ai/plugin）..."

    cd "$aet_dir" || log_error "无法进入 AET 目录"

    # 检查 package.json 是否存在
    if [ ! -f "$aet_dir/package.json" ]; then
        log_error "package.json 不存在: $aet_dir/package.json"
    fi

    # 运行 npm install 安装所有依赖
    if npm install; then
        log_success "npm 依赖安装成功"
        echo -e "\033[0;32m         @opencode-ai/plugin 已安装，AET 可在无网络环境下运行\033[0m"
    else
        # 安装失败，尝试重试
        log_info "首次安装失败，清理缓存后重试..."
        npm cache clean --force 2>/dev/null || true

        if npm install; then
            log_success "npm 依赖安装成功（重试后）"
            echo -e "\033[0;32m         @opencode-ai/plugin 已安装，AET 可在无网络环境下运行\033[0m"
        else
            log_error "npm 依赖安装失败\n       请确保网络可用后手动安装: cd $aet_dir && npm install"
        fi
    fi

    cd - > /dev/null
}

# 安装 gitnexus（可选工具，失败不影响主安装）
install_gitnexus() {
    # 检查 npx 是否可用
    if ! command -v npx >/dev/null 2>&1; then
        echo -e "\033[0;33m[提示]\033[0m 未找到 npx，跳过 gitnexus 安装"
        echo -e "\033[0;33m         项目分析功能将使用 npx 运行时下载，可能首次执行较慢\033[0m"
        return 0
    fi

    log_info "安装 gitnexus（项目分析工具）..."

    # 尝试全局安装 gitnexus（显示进度）
    if npx -y gitnexus@latest -V; then
        log_success "gitnexus 安装成功"
        echo -e "\033[0;32m         项目分析功能已就绪\033[0m"
    else
        echo -e "\033[0;33m[提示]\033[0m gitnexus 全局安装失败，但不影响 AET 正常使用"
        echo -e "\033[0;33m         项目分析功能将使用 npx 运行时下载，首次执行可能较慢\033[0m"
        echo -e "\033[0;33m         您可以稍后手动安装: npx -y gitnexus@latest -V\033[0m"
        return 0
    fi
}

# 下载源代码（远程安装）
download_source() {
    local repo="https://atomgit.com/leon-wang2021/agent-dev-team.git"
    local target="$HOME/.config/opencode/aet"
    
    log_info "下载源代码..."
    
    if [ -d "$target" ]; then
        log_info "目录已存在，删除旧目录..."
        rm -rf "$target" || log_error "无法删除目录 $target"
    fi
    log_info "克隆仓库..."
    git clone "$repo" "$target" || log_error "克隆仓库失败"
    
    log_success "源代码下载完成"
}

# 设置本地源目录（本地安装）
setup_local_source() {
    local current_dir="$(cd "$(dirname "$0")/.." && pwd)"
    
    # 检查是否为有效的 AET 项目目录
    if [ ! -f "$current_dir/.opencode/plugins/aet.js" ]; then
        log_error "本地目录不是有效的 AET 项目: $current_dir\n请确保在 AET 项目根目录下运行此脚本"
    fi
    
    log_info "使用本地源代码: $current_dir"
    
    # 如果 ~/.config/opencode/aet 已存在，提示用户
    local target="$HOME/.config/opencode/aet"
    if [ -d "$target" ]; then
        if [ "$(readlink -f "$target")" = "$(readlink -f "$current_dir")" ]; then
            log_info "已使用相同目录，跳过链接步骤"
        else
            log_info "目录已存在，删除旧目录..."
            rm -rf "$target" || log_error "无法删除目录 $target"
            # 创建符号链接代替复制
            ln -s "$current_dir" "$target" || log_error "无法创建目录链接"
            log_success "使用符号链接连接到本地源代码"
        fi
    else
        # 创建符号链接代替复制
        mkdir -p "$(dirname "$target")"
        ln -s "$current_dir" "$target" || log_error "无法创建目录链接"
        log_success "使用符号链接连接到本地源代码"
    fi
    
    # 返回源目录路径
    echo "$current_dir"
}

# 创建插件和skills目录
create_directories() {
    local aet_dir="$HOME/.config/opencode/aet"
    
    log_info "创建插件和skills目录..."
    
    # 创建插件目录
    mkdir -p "$HOME/.config/opencode/plugins" || log_error "无法创建插件目录"
    
    # 创建插件符号链接
    ln -sf "$aet_dir/.opencode/plugins/aet.js" "$HOME/.config/opencode/plugins/aet.js" || \
        log_error "无法创建插件符号链接"
    
    # 创建 skills 目录
    mkdir -p "$HOME/.config/opencode/skills" || log_error "无法创建 skills 目录"
    
    # 创建真实的 aet skills 目录
    local aet_skills_dir="$HOME/.config/opencode/skills/aet"

    # 如果目录已存在，先删除
    if [ -e "$aet_skills_dir" ]; then
        rm -rf "$aet_skills_dir" || log_error "无法删除旧的 aet skills 目录"
    fi

    # 创建新目录
    mkdir -p "$aet_skills_dir" || log_error "无法创建 aet skills 目录"

    # 复制 skills 内容
    cp -r "$aet_dir/skills"/* "$aet_skills_dir/" || log_error "无法复制 skills 内容"
    
    log_success "目录创建完成"
}

# 创建commands目录的符号链接
create_commands_symlinks() {
    local aet_dir="$HOME/.config/opencode/aet"
    local commands_dir="$HOME/.config/opencode/commands"
    
    log_info "创建commands目录的符号链接..."
    
    # 创建commands目录
    mkdir -p "$commands_dir" || log_error "无法创建commands目录"
    
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
        log_success "commands符号链接创建完成"
    else
        log_error "commands目录不存在: $aet_dir/commands"
    fi
}

# 全局配置初始化
init_global_config() {
    log_info "检查全局配置..."

    local global_config_dir="$HOME/.aet"
    local global_config_file="$global_config_dir/config.json"
    local force_reconfigure=false

    if [ -f "$global_config_file" ]; then
        log_info "全局配置已存在: $global_config_file"

        if command -v gum >/dev/null 2>&1; then
            # 使用 gum choose
            config_choice=$(gum choose \
                --header "全局配置已存在，请选择：" \
                --cursor.foreground 4 \
                --selected.foreground 2 \
                "重新配置（可添加/修改平台 Token）" \
                "跳过（保留现有配置，继续安装）")

            if [ "$config_choice" = "重新配置（可添加/修改平台 Token）" ]; then
                force_reconfigure=true
            else
                log_info "跳过全局配置初始化，保留现有配置"
                return 0
            fi
        else
            # 传统方式
            echo ""
            echo -e "\033[1;33m[提示]\033[0m 全局配置已存在"
            echo ""
            echo "选项:"
            echo "  1. 重新配置（可添加/修改平台 Token）"
            echo "  2. 跳过（保留现有配置，继续安装）"
            echo ""
            safe_read "请选择 (1/2): " config_num

            if [ "$config_num" = "1" ]; then
                force_reconfigure=true
            else
                log_info "跳过全局配置初始化，保留现有配置"
                return 0
            fi
        fi
    fi

    # 获取初始化脚本路径
    # 优先使用 AET 安装目录中的脚本（远程安装场景）
    local init_script="$HOME/.config/opencode/aet/scripts/init-global-config.sh"
    # 如果是本地安装，尝试从脚本所在目录获取
    if [ ! -f "$init_script" ]; then
        local script_dir="$(cd "$(dirname "$0")" && pwd)"
        init_script="$script_dir/init-global-config.sh"
    fi
    
    if [ ! -f "$init_script" ]; then
        log_error "全局配置初始化脚本不存在: $init_script"
        return 1
    fi
    
    # 执行全局配置初始化脚本
    if [ "$force_reconfigure" = true ]; then
        # 用户选择重新配置，传递 --force 跳过二次确认
        bash "$init_script" --force || {
            log_error "全局配置初始化失败"
            return 1
        }
    else
        # 首次安装，正常调用
        bash "$init_script" || {
            log_error "全局配置初始化失败"
            return 1
        }
    fi
    
    log_success "全局配置初始化完成"
    return 0
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

# 显示帮助
show_help() {
    echo "AET 安装脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -l, --local    使用本地源代码安装（开发模式）"
    echo "  -h, --help     显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                    # 从远程仓库安装"
    echo "  $0 --local            # 使用本地代码安装（开发模式）"
    echo ""
}

# 主函数
main() {
    local install_mode="remote"
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -l|--local)
                install_mode="local"
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                ;;
        esac
    done
    
    log_info "开始安装 AET..."
    check_dependencies
    
    if [ "$install_mode" = "local" ]; then
        log_info "模式: 本地安装（开发模式）"
        source_dir=$(setup_local_source)
        # 本地安装时，不需要复制，因为用的是符号链接
        # 但仍需要创建插件和skills目录的链接
        create_directories
        create_commands_symlinks
    else
        log_info "模式: 远程安装"
        download_source
        create_directories
        create_commands_symlinks
    fi
    
    # 安装 npm 依赖（必须在验证之前）
    install_dependencies

    verify_installation

    # 安装可选工具 gitnexus
    install_gitnexus
    
    # 全局配置初始化
    init_global_config
    
    log_success "AET 安装成功！"
    echo ""
    echo "您现在可以使用 AET 了！"
}

main "$@"
