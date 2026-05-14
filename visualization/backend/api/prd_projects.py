from flask import Blueprint, request, jsonify
from models import db, PRDProject
import os
from datetime import datetime

prd_projects_bp = Blueprint('prd_projects', __name__)


DEFAULT_PATH = os.path.dirname(os.path.dirname(os.getcwd()))


def get_default_project():
    default = PRDProject.query.filter_by(is_default=True).first()
    return default


def ensure_default_project():
    default = get_default_project()
    if default:
        return default
    
    existing_count = PRDProject.query.count()
    if existing_count > 0:
        return None
    
    real_path = os.path.realpath(DEFAULT_PATH) if DEFAULT_PATH else None
    if not real_path or not os.path.exists(real_path):
        return None
    
    default = PRDProject(
        path=real_path,
        name=os.path.basename(real_path),
        is_default=True
    )
    db.session.add(default)
    db.session.commit()
    return default


@prd_projects_bp.route('/prd-projects', methods=['GET'])
def get_prd_projects():
    ensure_default_project()
    
    projects = PRDProject.query.order_by(PRDProject.is_default.desc(), PRDProject.created_at.desc()).all()
    
    default_proj = get_default_project()
    default_path = default_proj.path if default_proj else None
    
    return jsonify({
        'success': True,
        'data': {
            'projects': [p.to_dict() for p in projects],
            'default_path': default_path
        }
    }), 200


@prd_projects_bp.route('/prd-projects', methods=['POST'])
def add_prd_project():
    data = request.get_json() or {}
    project_path = data.get('path', '')
    
    if not project_path:
        return jsonify({
            'success': False,
            'error': 'path is required'
        }), 400
    
    real_path = os.path.realpath(project_path)
    if not os.path.exists(real_path):
        return jsonify({
            'success': False,
            'error': 'path does not exist'
        }), 404
    
    existing = PRDProject.query.filter_by(path=real_path).first()
    if existing:
        return jsonify({
            'success': True,
            'data': existing.to_dict(),
            'message': 'Project already exists, skipped'
        }), 200
    
    project = PRDProject(
        path=real_path,
        name=os.path.basename(real_path),
        is_default=False
    )
    db.session.add(project)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': project.to_dict()
    }), 201


@prd_projects_bp.route('/prd-projects/<int:id>', methods=['DELETE'])
def delete_prd_project(id):
    project = PRDProject.query.get(id)
    if not project:
        return jsonify({
            'success': False,
            'error': 'Project not found'
        }), 404
    
    if project.is_default:
        return jsonify({
            'success': False,
            'error': 'Cannot delete default project'
        }), 400
    
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Project deleted'
    }), 200