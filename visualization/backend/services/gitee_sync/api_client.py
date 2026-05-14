"""
Gitee API Client

封装 Gitee API 调用，支持分页和错误重试。
"""

import time
import requests
from typing import Optional, List, Dict, Any
from datetime import datetime


class GiteeAPIError(Exception):
    """Gitee API 错误异常"""
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class GiteeAPIClient:
    """Gitee API 客户端"""

    def __init__(self, token: str, base_url: str = "https://gitee.com/api/v5"):
        """
        初始化 API 客户端

        Args:
            token: GitCode/Gitee Personal Access Token
            base_url: GitCode/Gitee 基础 URL
        """
        self.token = token
        self.base_url = base_url
        self.api_base = f"{base_url}/api/v5"
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        })

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """
        发送 API 请求

        Args:
            method: HTTP 方法
            endpoint: API 端点
            **kwargs: 其他请求参数

        Returns:
            响应数据
        """
        url = f"{self.api_base}{endpoint}"
        max_retries = 3
        retry_delay = 1

        for attempt in range(max_retries):
            try:
                response = self.session.request(method, url, **kwargs)

                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 401:
                    raise GiteeAPIError("Token 无效或已过期", 401)
                elif response.status_code == 403:
                    raise GiteeAPIError("权限不足", 403)
                elif response.status_code == 404:
                    raise GiteeAPIError("资源不存在", 404)
                elif response.status_code == 429:
                    wait_time = retry_delay * (2 ** attempt)
                    time.sleep(wait_time)
                    retry_delay += 1
                    continue
                else:
                    raise GiteeAPIError(f"API 请求失败: {response.status_code}", response.status_code)

            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    raise GiteeAPIError(f"请求失败: {str(e)}")
                time.sleep(retry_delay)

        raise GiteeAPIError("请求超时")

    def get_user_info(self) -> Dict[str, Any]:
        """获取当前用户信息"""
        return self._request("GET", "/user")

    def get_repo_info(self, owner: str, repo: str) -> Dict[str, Any]:
        """获取仓库信息"""
        return self._request("GET", f"/repos/{owner}/{repo}")

    def get_repo_issues(
        self,
        owner: str,
        repo: str,
        state: str = "all",
        page: int = 1,
        per_page: int = 100,
        sort: str = "updated",
        direction: str = "desc"
    ) -> List[Dict[str, Any]]:
        """
        获取仓库 Issue 列表

        Args:
            owner: 仓库所有者
            repo: 仓库名称
            state: Issue 状态 (open, closed, all)
            page: 页码
            per_page: 每页数量
            sort: 排序字段 (created, updated)
            direction: 排序方向 (asc, desc)

        Returns:
            Issue 列表
        """
        all_issues = []
        current_page = page

        while True:
            params = {
                "state": state,
                "page": current_page,
                "per_page": per_page,
                "sort": sort,
                "direction": direction
            }
            issues = self._request("GET", f"/repos/{owner}/{repo}/issues", params=params)

            if not issues:
                break

            all_issues.extend(issues)

            if len(issues) < per_page:
                break

            current_page += 1

        return all_issues

    def get_issue(
        self,
        owner: str,
        repo: str,
        issue_number: int
    ) -> Dict[str, Any]:
        """获取单个 Issue 详情"""
        return self._request("GET", f"/repos/{owner}/{repo}/issues/{issue_number}")

    def get_user_repos(self, page: int = 1, per_page: int = 100) -> List[Dict[str, Any]]:
        """获取用户仓库列表"""
        all_repos = []
        current_page = page

        while True:
            params = {
                "page": current_page,
                "per_page": per_page
            }
            repos = self._request("GET", "/user/repos", params=params)

            if not repos:
                break

            all_repos.extend(repos)

            if len(repos) < per_page:
                break

            current_page += 1

        return all_repos