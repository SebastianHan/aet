from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    issues = db.relationship('Issue', backref='project', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Issue(db.Model):
    __tablename__ = 'issues'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    issue_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    state = db.Column(db.String(50), default='open')
    design_status = db.Column(db.String(20), default='pending')
    development_status = db.Column(db.String(20), default='pending')
    testing_status = db.Column(db.String(20), default='pending')
    web_url = db.Column(db.String(500))
    assignee = db.Column(db.String(255))
    current_phase = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    events = db.relationship('IssueEvent', backref='issue', lazy=True, cascade='all, delete-orphan')
    
    __table_args__ = (db.UniqueConstraint('project_id', 'issue_number', name='uq_project_issue'),)
    
    PHASES = ['TODO', 'CLAIMED', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'PR_SUBMITTED', 'COMPLETED']
    
    def get_phase_name(self):
        if 0 <= self.current_phase < len(self.PHASES):
            return self.PHASES[self.current_phase]
        return 'TODO'
    
    def calculate_phase(self):
        if self.state == 'closed':
            return 6
        if self.testing_status == 'completed':
            return 5
        if self.testing_status == 'in_progress':
            return 4
        if self.development_status == 'completed':
            return 4
        if self.development_status == 'in_progress':
            return 3
        if self.design_status == 'completed':
            return 3
        if self.design_status == 'in_progress':
            return 2
        if self.assignee:
            return 1
        return 0
    
    def to_dict(self):
        phase = self.calculate_phase()
        return {
            'id': self.id,
            'project_id': self.project_id,
            'issue_number': self.issue_number,
            'title': self.title,
            'description': self.description,
            'state': self.state,
            'design_status': self.design_status,
            'development_status': self.development_status,
            'testing_status': self.testing_status,
            'web_url': self.web_url,
            'assignee': self.assignee,
            'assignee_display': f"{self.assignee} agent" if self.assignee else None,
            'current_phase': phase,
            'phase_name': self.PHASES[phase] if 0 <= phase < len(self.PHASES) else 'TODO',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class IssueEvent(db.Model):
    __tablename__ = 'issue_events'
    
    id = db.Column(db.Integer, primary_key=True)
    issue_id = db.Column(db.Integer, db.ForeignKey('issues.id', ondelete='CASCADE'), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.String(255))
    event_metadata = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'issue_id': self.issue_id,
            'event_type': self.event_type,
            'user_id': self.user_id,
            'metadata': self.event_metadata,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(255), primary_key=True)
    display_name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'display_name': self.display_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class PRDProject(db.Model):
    """PRD项目路径记录 - 用于PRD文件查看器的项目选择"""
    __tablename__ = 'prd_projects'
    
    id = db.Column(db.Integer, primary_key=True)
    path = db.Column(db.String(500), unique=True, nullable=False)  # 项目绝对路径
    name = db.Column(db.String(255), nullable=False)  # 项目名称（目录名）
    is_default = db.Column(db.Boolean, default=False)  # 是否为默认项目
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'path': self.path,
            'name': self.name,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
