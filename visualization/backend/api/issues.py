from flask import Blueprint, jsonify, request
from models import db, IssueEvent, Issue

issues_bp = Blueprint('issues', __name__)

@issues_bp.route('/issues/<int:issue_id>', methods=['GET'])
def get_issue(issue_id):
    try:
        issue = Issue.query.get(issue_id)
        if not issue:
            return jsonify({
                'success': False,
                'error': 'Issue not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': issue.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@issues_bp.route('/issues/<int:issue_id>/phase', methods=['PATCH'])
def update_issue_phase(issue_id):
    try:
        issue = Issue.query.get(issue_id)
        if not issue:
            return jsonify({
                'success': False,
                'error': 'Issue not found'
            }), 404
        
        data = request.get_json()
        phase = data.get('phase')
        
        if phase is None or not isinstance(phase, int) or phase < 0 or phase > 6:
            return jsonify({
                'success': False,
                'error': 'Invalid phase value. Must be 0-6'
            }), 400
        
        issue.current_phase = phase
        
        if phase == 0:
            issue.assignee = None
            issue.design_status = 'pending'
            issue.development_status = 'pending'
            issue.testing_status = 'pending'
        elif phase == 1:
            issue.design_status = 'pending'
            issue.development_status = 'pending'
            issue.testing_status = 'pending'
        elif phase == 2:
            issue.design_status = 'in_progress'
            issue.development_status = 'pending'
            issue.testing_status = 'pending'
        elif phase == 3:
            issue.design_status = 'completed'
            issue.development_status = 'in_progress'
            issue.testing_status = 'pending'
        elif phase == 4:
            issue.design_status = 'completed'
            issue.development_status = 'completed'
            issue.testing_status = 'in_progress'
        elif phase == 5:
            issue.design_status = 'completed'
            issue.development_status = 'completed'
            issue.testing_status = 'completed'
        elif phase == 6:
            issue.state = 'closed'
            issue.design_status = 'completed'
            issue.development_status = 'completed'
            issue.testing_status = 'completed'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': issue.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@issues_bp.route('/issues/<int:issue_id>/events', methods=['GET'])
def get_issue_events(issue_id):
    try:
        issue = Issue.query.get(issue_id)
        if not issue:
            return jsonify({
                'success': False,
                'error': 'Issue not found'
            }), 404
        
        events = IssueEvent.query.filter_by(issue_id=issue_id).order_by(IssueEvent.timestamp.asc()).all()
        
        return jsonify({
            'success': True,
            'data': [event.to_dict() for event in events]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
