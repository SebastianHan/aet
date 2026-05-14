"""
Gitee 同步配置 API

提供同步配置管理的 REST API 端点。
"""

from flask import Blueprint, jsonify, request
from datetime import datetime

sync_bp = Blueprint('sync', __name__)


@sync_bp.route('/sync/config', methods=['GET'])
def get_sync_config():
    """获取同步配置"""
    from services.gitee_sync import get_config_manager, SyncConfig, db

    config_manager = get_config_manager()
    db_config = SyncConfig.query.first()

    if not db_config:
        db_config = SyncConfig()
        db.session.add(db_config)
        db.session.commit()

    return jsonify({
        'success': True,
        'data': {
            'platform': config_manager.platform,
            'sync_interval_hours': db_config.sync_interval_hours or config_manager.sync_interval_hours,
            'enabled': db_config.enabled if db_config.enabled is not None else config_manager.enabled,
            'last_sync_at': config_manager.last_sync_at,
            'token_configured': bool(config_manager.token)
        }
    }), 200


@sync_bp.route('/sync/config', methods=['PUT'])
def update_sync_config():
    """更新同步配置"""
    from services.gitee_sync import get_config_manager, SyncConfig, db

    data = request.get_json()
    config_manager = get_config_manager()

    db_config = SyncConfig.query.first()
    if not db_config:
        db_config = SyncConfig()
        db.session.add(db_config)

    if 'sync_interval_hours' in data:
        db_config.sync_interval_hours = data['sync_interval_hours']
        config_manager.sync_interval_hours = data['sync_interval_hours']

    if 'enabled' in data:
        db_config.enabled = data['enabled']
        config_manager.enabled = data['enabled']

    db.session.commit()

    return jsonify({
        'success': True,
        'data': db_config.to_dict()
    }), 200


@sync_bp.route('/sync/trigger', methods=['POST'])
def trigger_sync():
    """手动触发同步"""
    from services.gitee_sync import get_scheduler, create_sync_worker
    from models import Project, Issue, IssueEvent

    data = request.get_json() or {}
    repo_owner = data.get('repo_owner')
    repo_name = data.get('repo_name')

    try:
        worker = create_sync_worker()

        if repo_owner and repo_name:
            project = Project.query.filter_by(repo_owner=repo_owner, repo_name=repo_name).first()
            if not project:
                return jsonify({
                    'success': False,
                    'error': 'Project not found'
                }), 404

            result = worker.sync_project_issues(
                project.id,
                repo_owner,
                repo_name,
                Issue,
                IssueEvent
            )
        else:
            result = worker.sync_all_projects(Project, Issue, IssueEvent)

        scheduler = get_scheduler()
        job_id = scheduler.trigger_now(
            _run_sync,
            project_model_class=Project,
            issue_model_class=Issue,
            issue_event_model_class=IssueEvent
        )

        return jsonify({
            'success': True,
            'message': 'Sync job triggered',
            'job_id': job_id,
            'result': result
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@sync_bp.route('/sync/status', methods=['GET'])
def get_sync_status():
    """获取同步状态"""
    from services.gitee_sync import get_scheduler, get_config_manager

    scheduler = get_scheduler()
    config_manager = get_config_manager()

    return jsonify({
        'success': True,
        'data': {
            'scheduler_running': scheduler.is_running,
            'scheduler_status': scheduler.get_job_status(),
            'config': config_manager.to_dict()
        }
    }), 200


@sync_bp.route('/sync/excluded', methods=['GET'])
def get_excluded_repos():
    """获取排除仓库列表"""
    from services.gitee_sync import ExcludedRepo, db

    repos = ExcludedRepo.query.all()

    return jsonify({
        'success': True,
        'data': [repo.to_dict() for repo in repos]
    }), 200


@sync_bp.route('/sync/excluded', methods=['POST'])
def add_excluded_repo():
    """添加排除仓库"""
    from services.gitee_sync import ExcludedRepo, get_config_manager, db

    data = request.get_json()
    owner = data.get('owner')
    repo = data.get('repo')
    reason = data.get('reason', '')

    if not owner or not repo:
        return jsonify({
            'success': False,
            'error': 'owner and repo are required'
        }), 400

    existing = ExcludedRepo.query.filter_by(owner=owner, repo=repo).first()
    if existing:
        return jsonify({
            'success': False,
            'error': 'Repository already excluded'
        }), 400

    excluded_repo = ExcludedRepo(owner=owner, repo=repo, reason=reason)
    db.session.add(excluded_repo)
    db.session.commit()

    config_manager = get_config_manager()
    config_manager.add_excluded_repo(owner, repo, reason)

    return jsonify({
        'success': True,
        'data': excluded_repo.to_dict()
    }), 201


@sync_bp.route('/sync/excluded/<int:repo_id>', methods=['DELETE'])
def remove_excluded_repo(repo_id):
    """移除排除仓库"""
    from services.gitee_sync import ExcludedRepo, get_config_manager, db

    excluded_repo = ExcludedRepo.query.get(repo_id)
    if not excluded_repo:
        return jsonify({
            'success': False,
            'error': 'Excluded repository not found'
        }), 404

    config_manager = get_config_manager()
    config_manager.remove_excluded_repo(excluded_repo.owner, excluded_repo.repo)

    db.session.delete(excluded_repo)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Repository removed from excluded list'
    }), 200


@sync_bp.route('/sync/logs', methods=['GET'])
def get_sync_logs():
    """获取同步日志"""
    from services.gitee_sync import SyncLog, db

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = SyncLog.query.order_by(SyncLog.started_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'success': True,
        'data': [log.to_dict() for log in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total
        }
    }), 200


def _run_sync(project_model_class, issue_model_class, issue_event_model_class):
    """内部同步函数"""
    from services.gitee_sync import create_sync_worker
    worker = create_sync_worker()
    return worker.sync_all_projects(project_model_class, issue_model_class, issue_event_model_class)