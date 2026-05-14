"""
Gitee 同步相关的数据模型

扩展现有的 Issue 模型，添加同步相关的字段。
"""

from datetime import datetime
from models import db


class SyncConfig(db.Model):
    """同步配置"""
    __tablename__ = 'sync_config'

    id = db.Column(db.Integer, primary_key=True)
    platform = db.Column(db.String(20), default='gitee')
    sync_interval_hours = db.Column(db.Integer, default=6)
    enabled = db.Column(db.Boolean, default=True)
    last_sync_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'platform': self.platform,
            'sync_interval_hours': self.sync_interval_hours,
            'enabled': self.enabled,
            'last_sync_at': self.last_sync_at.isoformat() if self.last_sync_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class ExcludedRepo(db.Model):
    """排除的仓库"""
    __tablename__ = 'excluded_repos'

    id = db.Column(db.Integer, primary_key=True)
    owner = db.Column(db.String(100), nullable=False)
    repo = db.Column(db.String(100), nullable=False)
    reason = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('owner', 'repo', name='uq_excluded_repo'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'owner': self.owner,
            'repo': self.repo,
            'reason': self.reason,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class SyncLog(db.Model):
    """同步日志"""
    __tablename__ = 'sync_logs'

    id = db.Column(db.Integer, primary_key=True)
    repo_owner = db.Column(db.String(100))
    repo_name = db.Column(db.String(100))
    issues_count = db.Column(db.Integer, default=0)
    created_count = db.Column(db.Integer, default=0)
    updated_count = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20))
    error_message = db.Column(db.Text)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'repo_owner': self.repo_owner,
            'repo_name': self.repo_name,
            'issues_count': self.issues_count,
            'created_count': self.created_count,
            'updated_count': self.updated_count,
            'status': self.status,
            'error_message': self.error_message,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class IssueSyncMixin:
    """Issue 同步字段混入类"""

    source = db.Column(db.String(20), default='manual')
    gitee_id = db.Column(db.BigInteger)
    gitee_labels = db.Column(db.Text)
    gitee_created_at = db.Column(db.DateTime)
    gitee_updated_at = db.Column(db.DateTime)
    gitee_closed_at = db.Column(db.DateTime)
    synced_at = db.Column(db.DateTime)


def merge_issue(existing_issue, gitee_data: dict) -> object:
    """合并 Gitee 数据到现有 Issue"""
    from datetime import datetime
    import json

    if existing_issue.title and existing_issue.source == 'manual':
        pass
    else:
        existing_issue.title = gitee_data.get('title', '')

    if existing_issue.description and existing_issue.source == 'manual':
        pass
    else:
        existing_issue.description = gitee_data.get('body', '')

    existing_issue.state = gitee_data.get('state', 'open')

    if gitee_data.get('assignee'):
        existing_issue.assignee = gitee_data['assignee'].get('login')

    if gitee_data.get('updated_at'):
        existing_issue.gitee_updated_at = parse_datetime(gitee_data.get('updated_at'))

    if gitee_data.get('closed_at'):
        existing_issue.gitee_closed_at = parse_datetime(gitee_data['closed_at'])

    if gitee_data.get('created_at'):
        existing_issue.gitee_created_at = parse_datetime(gitee_data['created_at'])

    labels = [label.get('name', '') for label in gitee_data.get('labels', [])]
    existing_issue.gitee_labels = json.dumps(labels)

    existing_issue.source = 'merged'
    existing_issue.gitee_id = gitee_data.get('id')
    existing_issue.synced_at = datetime.utcnow()

    return existing_issue


def parse_datetime(date_str: str) -> datetime:
    """解析 ISO 格式日期时间"""
    if not date_str:
        return None
    try:
        if '+' in date_str:
            date_str = date_str.split('+')[0]
        elif 'Z' in date_str:
            date_str = date_str.replace('Z', '')
        return datetime.fromisoformat(date_str)
    except (ValueError, AttributeError):
        return None