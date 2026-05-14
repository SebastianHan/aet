"""
Gitee 同步 Worker

执行同步任务的核心逻辑。
"""

import json
from datetime import datetime
from typing import Optional, Dict, Any, List

from .api_client import GiteeAPIClient
from .config import get_config_manager
from .models import db, SyncLog, parse_datetime


class SyncWorker:
    """Gitee 同步工作器"""

    def __init__(self, token: str, base_url: str = "https://gitee.com"):
        self.client = GiteeAPIClient(token, base_url)
        self.config = get_config_manager()

    def sync_project_issues(
        self,
        project_id: int,
        repo_owner: str,
        repo_name: str,
        issue_model_class,
        issue_event_model_class
    ) -> Dict[str, Any]:
        """
        同步单个项目的 Issue 数据

        Args:
            project_id: 项目 ID
            repo_owner: 仓库所有者
            repo_name: 仓库名称
            issue_model_class: Issue 模型类
            issue_event_model_class: IssueEvent 模型类

        Returns:
            同步结果
        """
        if self.config.is_repo_excluded(repo_owner, repo_name):
            return {
                "status": "skipped",
                "reason": "Repository is excluded",
                "issues_count": 0,
                "created_count": 0,
                "updated_count": 0
            }

        started_at = datetime.utcnow()
        sync_log = SyncLog(
            repo_owner=repo_owner,
            repo_name=repo_name,
            started_at=started_at
        )
        db.session.add(sync_log)

        try:
            gitee_issues = self.client.get_repo_issues(repo_owner, repo_name, state="all")
            sync_log.issues_count = len(gitee_issues)

            created_count = 0
            updated_count = 0

            for gitee_issue in gitee_issues:
                issue_number = gitee_issue.get('number')
                existing_issue = issue_model_class.query.filter_by(
                    project_id=project_id,
                    issue_number=issue_number
                ).first()

                if not existing_issue:
                    new_issue = issue_model_class(
                        project_id=project_id,
                        issue_number=issue_number,
                        title=gitee_issue.get('title', ''),
                        description=gitee_issue.get('body', ''),
                        state=gitee_issue.get('state', 'open'),
                        web_url=gitee_issue.get('html_url')
                    )
                    if gitee_issue.get('assignee'):
                        new_issue.assignee = gitee_issue['assignee'].get('login')
                    db.session.add(new_issue)
                    created_count += 1
                else:
                    existing_issue.state = gitee_issue.get('state', 'open')
                    if gitee_issue.get('assignee'):
                        existing_issue.assignee = gitee_issue['assignee'].get('login')
                    if gitee_issue.get('assignee'):
                        existing_issue.assignee = gitee_issue['assignee'].get('login')
                    updated_count += 1

            db.session.commit()

            sync_log.created_count = created_count
            sync_log.updated_count = updated_count
            sync_log.status = 'success'
            sync_log.completed_at = datetime.utcnow()
            db.session.commit()

            return {
                "status": "success",
                "issues_count": len(gitee_issues),
                "created_count": created_count,
                "updated_count": updated_count
            }

        except Exception as e:
            db.session.rollback()
            sync_log.status = 'failed'
            sync_log.error_message = str(e)
            sync_log.completed_at = datetime.utcnow()
            db.session.commit()

            return {
                "status": "failed",
                "error": str(e),
                "issues_count": 0,
                "created_count": 0,
                "updated_count": 0
            }

    def sync_all_projects(
        self,
        project_model_class,
        issue_model_class,
        issue_event_model_class
    ) -> Dict[str, Any]:
        """
        同步所有项目的 Issue 数据

        Returns:
            同步结果汇总
        """
        projects = project_model_class.query.all()
        results = []
        total_created = 0
        total_updated = 0
        failed_count = 0

        for project in projects:
            if hasattr(project, 'repo_owner') and hasattr(project, 'repo_name') and project.repo_owner and project.repo_name:
                repo_owner = project.repo_owner
                repo_name = project.repo_name
            else:
                if '/' in project.name:
                    parts = project.name.split('/')
                    repo_owner = parts[0]
                    repo_name = parts[-1]
                else:
                    continue
            
            if repo_owner and repo_name:
                result = self.sync_project_issues(
                    project.id,
                    repo_owner,
                    repo_name,
                    issue_model_class,
                    issue_event_model_class
                )
                results.append({
                    "project_id": project.id,
                    "project_name": project.name,
                    **result
                })
                total_created += result.get("created_count", 0)
                total_updated += result.get("updated_count", 0)
                if result.get("status") == "failed":
                    failed_count += 1

        self.config.last_sync_at = datetime.utcnow().isoformat() + "Z"

        return {
            "total_projects": len(projects),
            "total_created": total_created,
            "total_updated": total_updated,
            "failed_count": failed_count,
            "results": results
        }


def create_sync_worker() -> SyncWorker:
    """创建同步工作器"""
    config = get_config_manager()
    token = config.token
    if not token:
        raise ValueError("Gitee token not configured")

    from scripts.get_gitee_token import decrypt_token
    decrypted_token = decrypt_token(token)

    base_url = config.api_base_url.replace('/api/v5', '')
    return SyncWorker(decrypted_token, base_url)