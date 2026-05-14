from flask import Blueprint, request, jsonify
from models import db, Project, Issue, IssueEvent
from sqlalchemy import func

projects_bp = Blueprint('projects', __name__)

PHASES = [
    {'id': 0, 'name': 'TODO', 'label': '待处理', 'color': '#9e9e9e'},
    {'id': 1, 'name': 'CLAIMED', 'label': '已认领', 'color': '#2196f3'},
    {'id': 2, 'name': 'DESIGN', 'label': '设计', 'color': '#9c27b0'},
    {'id': 3, 'name': 'DEVELOPMENT', 'label': '开发', 'color': '#ff9800'},
    {'id': 4, 'name': 'TESTING', 'label': '测试', 'color': '#f44336'},
    {'id': 5, 'name': 'PR_SUBMITTED', 'label': '提交PR', 'color': '#00bcd4'},
    {'id': 6, 'name': 'COMPLETED', 'label': '已完成', 'color': '#4caf50'}
]

@projects_bp.route('/projects', methods=['GET'])
def get_projects():
    try:
        projects = Project.query.order_by(Project.name).all()
        return jsonify({
            'success': True,
            'data': [p.to_dict() for p in projects]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@projects_bp.route('/projects/kanban', methods=['GET'])
def get_kanban():
    try:
        project_id = request.args.get('project_id', type=int)
        
        if project_id:
            projects = [Project.query.get_or_404(project_id)]
        else:
            projects = Project.query.order_by(Project.name).all()
        
        project_data = [p.to_dict() for p in projects]
        
        issues = Issue.query.all()
        if project_id:
            issues = [i for i in issues if i.project_id == project_id]
        
        phases_data = []
        for phase in PHASES:
            phase_issues = [i for i in issues if i.calculate_phase() == phase['id']]
            phases_data.append({
                'id': phase['id'],
                'name': phase['name'],
                'label': phase['label'],
                'color': phase['color'],
                'issues': [i.to_dict() for i in phase_issues]
            })
        
        return jsonify({
            'success': True,
            'data': {
                'projects': project_data,
                'phases': phases_data
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@projects_bp.route('/projects/<int:project_id>/issues', methods=['GET'])
def get_project_issues(project_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        state = request.args.get('state')
        
        query = Issue.query.filter_by(project_id=project_id)
        
        if state:
            query = query.filter_by(state=state)
        
        pagination = query.order_by(Issue.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': [issue.to_dict() for issue in pagination.items],
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'total_pages': pagination.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@projects_bp.route('/projects/<int:project_id>/stats', methods=['GET'])
def get_project_stats(project_id):
    try:
        total_issues = Issue.query.filter_by(project_id=project_id).count()
        open_issues = Issue.query.filter_by(project_id=project_id, state='open').count()
        closed_issues = Issue.query.filter_by(project_id=project_id, state='closed').count()
        
        issues_by_state = {
            'open': open_issues,
            'closed': closed_issues
        }
        
        issue_ids = [issue.id for issue in Issue.query.filter_by(project_id=project_id).all()]
        
        issues_by_event_type = {}
        if issue_ids:
            events = IssueEvent.query.filter(IssueEvent.issue_id.in_(issue_ids)).all()
            for event in events:
                issues_by_event_type[event.event_type] = issues_by_event_type.get(event.event_type, 0) + 1
        
        return jsonify({
            'success': True,
            'data': {
                'total_issues': total_issues,
                'open_issues': open_issues,
                'closed_issues': closed_issues,
                'issues_by_state': issues_by_state,
                'issues_by_event_type': issues_by_event_type
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@projects_bp.route('/projects/<int:project_id>/phases/stats', methods=['GET'])
def get_project_phase_stats(project_id):
    try:
        issues = Issue.query.filter_by(project_id=project_id).all()
        
        phases = ['design_status', 'development_status', 'testing_status']
        phase_names = {'design_status': 'design', 'development_status': 'development', 'testing_status': 'testing'}
        
        result = {}
        for phase in phases:
            stats = {'pending': 0, 'in_progress': 0, 'completed': 0}
            for issue in issues:
                status = getattr(issue, phase, 'pending') or 'pending'
                stats[status] = stats.get(status, 0) + 1
            result[phase_names[phase]] = stats
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
