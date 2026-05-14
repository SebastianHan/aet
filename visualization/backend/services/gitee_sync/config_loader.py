"""
Gitee 同步服务集成

将 Gitee 同步功能集成到 Flask 应用。
"""

from flask import Flask
from .scheduler import get_scheduler
from .models import db


def init_gitee_sync(app: Flask):
    """
    初始化 Gitee 同步服务

    Args:
        app: Flask 应用实例
    """
    from .config import get_config_manager

    config = get_config_manager()

    if config.enabled and config.token:
        from .sync_worker import create_sync_worker
        from models import Project, Issue, IssueEvent

        def run_sync():
            worker = create_sync_worker()
            return worker.sync_all_projects(Project, Issue, IssueEvent)

        scheduler = get_scheduler()
        scheduler.start(
            run_sync,
            interval_hours=config.sync_interval_hours,
            project_model_class=Project,
            issue_model_class=Issue,
            issue_event_model_class=IssueEvent
        )

    return app


def register_sync_api(app: Flask):
    """注册同步 API"""
    from api.sync import sync_bp
    app.register_blueprint(sync_bp, url_prefix="/api")
    return app