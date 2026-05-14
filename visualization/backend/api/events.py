from flask import Blueprint, request, jsonify
from models import db, IssueEvent, Issue, Project
import json

events_bp = Blueprint("events", __name__)

PHASE_EVENT_MAPPING = {
    'created': ('design_status', 'pending'),
    'claimed': ('design_status', 'pending'),
    'design_start': ('design_status', 'in_progress'),
    'design_complete': ('design_status', 'completed'),
    'development_start': ('development_status', 'in_progress'),
    'development_complete': ('development_status', 'completed'),
    'testing_start': ('testing_status', 'in_progress'),
    'testing_complete': ('testing_status', 'completed'),
    'pr_submitted': ('testing_status', 'completed'),
}


@events_bp.route("/events", methods=["POST"])
def create_event():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "No JSON data provided"}), 400

        required_fields = ["project_name", "issue_number", "event_type"]
        for field in required_fields:
            if field not in data:
                return jsonify(
                    {"success": False, "error": f"Missing required field: {field}"}
                ), 400

        project_name = data["project_name"]
        issue_number = data["issue_number"]
        event_type = data["event_type"]
        user_id = data.get("user_id")
        metadata = data.get("metadata", {})

        project = Project.query.filter_by(name=project_name).first()
        if not project:
            project = Project(name=project_name)
            db.session.add(project)
            db.session.flush()

        issue = Issue.query.filter_by(
            project_id=project.id, issue_number=issue_number
        ).first()

        if not issue:
            issue_title = metadata.get("issue_title", f"Issue #{issue_number}")
            issue = Issue(
                project_id=project.id, issue_number=issue_number, title=issue_title
            )
            db.session.add(issue)
            db.session.flush()

        if event_type in PHASE_EVENT_MAPPING:
            status_field, new_status = PHASE_EVENT_MAPPING[event_type]
            setattr(issue, status_field, new_status)

        if user_id and not issue.assignee and event_type in ('claimed', 'design_start', 'development_start', 'testing_start'):
            issue.assignee = user_id

        issue_url = metadata.get("issue_url")
        if issue_url and not issue.web_url:
            issue.web_url = issue_url

        event = IssueEvent(
            issue_id=issue.id,
            event_type=event_type,
            user_id=user_id,
            event_metadata=json.dumps(metadata) if metadata else None,
        )

        db.session.add(event)
        db.session.commit()

        return jsonify(
            {
                "success": True,
                "event_id": event.id,
                "message": "Event recorded successfully",
            }
        ), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
