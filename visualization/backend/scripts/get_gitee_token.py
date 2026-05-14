#!/usr/bin/env python3
"""
Gitee Token 获取脚本

引导用户获取 Gitee Personal Access Token 并保存到配置文件。
"""

import os
import sys
import json
import requests
from datetime import datetime
from pathlib import Path

CONFIG_DIR = "config"
CONFIG_FILE = "gitee_config.json"
CONFIG_FILE_PATH = os.path.join(CONFIG_DIR, CONFIG_FILE)

PLATFORMS = {
    "gitee": "https://gitee.com",
    "gitcode": "https://gitcode.com"
}

PLATFORM_API_BASE = {
    "gitee": "https://gitee.com/api/v5",
    "gitcode": "https://gitcode.com/api/v5"
}

REQUIRED_SCOPES = ["repo", "user"]


def encrypt_token(token: str) -> str:
    """使用 Fernet 加密 Token"""
    try:
        from cryptography.fernet import Fernet
        key = os.environ.get("GITEE_TOKEN_KEY")
        if not key:
            return token
        key_bytes = key.encode() if len(key) == 44 else key.ljust(32)[:32].encode()
        f = Fernet(key_bytes)
        return f.encrypt(token.encode()).decode()
    except Exception:
        return token


def decrypt_token(encrypted_token: str) -> str:
    """解密 Token"""
    try:
        from cryptography.fernet import Fernet
        key = os.environ.get("GITEE_TOKEN_KEY")
        if not key:
            return encrypted_token
        key_bytes = key.encode() if len(key) == 44 else key.ljust(32)[:32].encode()
        f = Fernet(key_bytes)
        return f.decrypt(encrypted_token.encode()).decode()
    except Exception:
        return encrypted_token


def validate_token(token: str, base_url: str) -> dict:
    """验证 Token 是否有效"""
    api_base = base_url + "/api/v5"
    try:
        response = requests.get(
            f"{api_base}/user",
            headers={"Authorization": f"token {token}"},
            timeout=10
        )
        if response.status_code == 200:
            user_data = response.json()
            return {
                "valid": True,
                "user": {
                    "login": user_data.get("login"),
                    "id": user_data.get("id")
                }
            }
        else:
            return {"valid": False, "error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"valid": False, "error": str(e)}


def save_config(config_data: dict) -> None:
    """保存配置到文件"""
    os.makedirs(CONFIG_DIR, exist_ok=True)
    config_path = CONFIG_FILE_PATH
    config_data["updated_at"] = datetime.utcnow().isoformat() + "Z"
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config_data, f, indent=2, ensure_ascii=False)


def load_config() -> dict:
    """加载配置文件"""
    config_path = CONFIG_FILE_PATH
    if not os.path.exists(config_path):
        return {}
    with open(config_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def print_welcome():
    """打印欢迎信息"""
    print("\n" + "=" * 60)
    print("        Gitee Token 获取向导")
    print("=" * 60)
    print("\n此脚本将帮助您获取并配置 Gitee 访问令牌。")
    print("Token 用于自动同步仓库的 Issue 数据。\n")


def print_platform_guide(platform: str):
    """打印平台 Token 创建指引"""
    print(f"\n请按照以下步骤在 {PLATFORMS[platform]} 创建 Token:")
    print("-" * 40)
    print("1. 登录您的账户")
    print("2. 进入【设置】->【开发者设置】")
    print("3. 点击【个人访问令牌】->【生成新令牌】")
    print("4. 填写令牌描述（如：Issue Sync）")
    print("5. 勾选以下权限:")
    for scope in REQUIRED_SCOPES:
        print(f"   - {scope}")
    print("6. 点击【生成令牌】")
    print("7. 复制生成的 Token（请妥善保存，仅显示一次）\n")


def main():
    """主函数"""
    print_welcome()

    print("请选择平台:")
    for i, (key, value) in enumerate(PLATFORMS.items(), 1):
        print(f"  {i}. {key} ({value})")
    
    while True:
        choice = input("\n请输入选项 (1-2): ").strip()
        if choice in ["1", "2"]:
            platform = list(PLATFORMS.keys())[int(choice) - 1]
            break
        print("无效选项，请重试。")

    print_platform_guide(platform)

    token = input("请输入您的 Token: ").strip()
    if not token:
        print("错误: Token 不能为空")
        sys.exit(1)

    print("\n正在验证 Token...")
    base_url = PLATFORMS[platform]
    validation = validate_token(token, base_url)

    if not validation["valid"]:
        print(f"\n错误: Token 验证失败 - {validation.get('error', '未知错误')}")
        sys.exit(1)

    print(f"\n✓ Token 验证成功! 欢迎, {validation['user']['login']}")

    encrypted_token = encrypt_token(token)
    
    config_data = {
        "platform": platform,
        "token": encrypted_token,
        "user": validation["user"],
        "api_base_url": PLATFORM_API_BASE[platform],
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }

    save_config(config_data)
    print(f"\n✓ 配置已保存到 {CONFIG_FILE_PATH}")
    print("\n您现在可以启动同步服务了。")


if __name__ == "__main__":
    main()