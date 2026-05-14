"""
Gitee 同步配置管理

管理同步配置、排除仓库列表等。
"""

import os
import json
from typing import Optional, List, Dict, Any


class SyncConfigManager:
    """同步配置管理器"""

    DEFAULT_CONFIG = {
        "platform": "gitee",
        "sync_interval_hours": 6,
        "enabled": True,
        "excluded_repos": []
    }

    def __init__(self, config_path: str = "config/gitee_config.json"):
        self.config_path = config_path
        self._config: Dict[str, Any] = {}
        self.load()

    def load(self) -> None:
        """加载配置"""
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self._config = json.load(f)
        else:
            self._config = self.DEFAULT_CONFIG.copy()

    def save(self) -> None:
        """保存配置"""
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(self._config, f, indent=2, ensure_ascii=False)

    @property
    def platform(self) -> str:
        return self._config.get("platform", "gitee")

    @property
    def token(self) -> Optional[str]:
        return self._config.get("token")

    @property
    def api_base_url(self) -> str:
        return self._config.get("api_base_url", "https://gitee.com/api/v5")

    @property
    def sync_interval_hours(self) -> int:
        return self._config.get("sync_interval_hours", 6)

    @sync_interval_hours.setter
    def sync_interval_hours(self, value: int) -> None:
        self._config["sync_interval_hours"] = value
        self.save()

    @property
    def enabled(self) -> bool:
        return self._config.get("enabled", True)

    @enabled.setter
    def enabled(self, value: bool) -> None:
        self._config["enabled"] = value
        self.save()

    @property
    def excluded_repos(self) -> List[Dict[str, str]]:
        return self._config.get("excluded_repos", [])

    def add_excluded_repo(self, owner: str, repo: str, reason: str = "") -> None:
        """添加排除仓库"""
        excluded = self._config.get("excluded_repos", [])
        if not any(r.get("owner") == owner and r.get("repo") == repo for r in excluded):
            excluded.append({"owner": owner, "repo": repo, "reason": reason})
            self._config["excluded_repos"] = excluded
            self.save()

    def remove_excluded_repo(self, owner: str, repo: str) -> None:
        """移除排除仓库"""
        excluded = self._config.get("excluded_repos", [])
        self._config["excluded_repos"] = [
            r for r in excluded if not (r.get("owner") == owner and r.get("repo") == repo)
        ]
        self.save()

    def is_repo_excluded(self, owner: str, repo: str) -> bool:
        """检查仓库是否被排除"""
        return any(
            r.get("owner") == owner and r.get("repo") == repo
            for r in self.excluded_repos
        )

    @property
    def last_sync_at(self) -> Optional[str]:
        return self._config.get("last_sync_at")

    @last_sync_at.setter
    def last_sync_at(self, value: str) -> None:
        self._config["last_sync_at"] = value
        self.save()

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "platform": self.platform,
            "sync_interval_hours": self.sync_interval_hours,
            "enabled": self.enabled,
            "last_sync_at": self.last_sync_at,
            "token_configured": bool(self.token)
        }


_config_manager: Optional[SyncConfigManager] = None


def get_config_manager() -> SyncConfigManager:
    """获取配置管理器单例"""
    global _config_manager
    if _config_manager is None:
        _config_manager = SyncConfigManager()
    return _config_manager