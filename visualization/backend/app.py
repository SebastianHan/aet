from flask import Flask, jsonify, send_from_directory
from werkzeug.security import safe_join
from flask_cors import CORS
from models import db
import os

app = Flask(__name__, static_folder="../frontend/dist")

# SECURITY: Generate a strong secret key if not provided
_secret_key = os.environ.get("SECRET_KEY")
if not _secret_key:
    import secrets
    _secret_key = secrets.token_hex(32)
app.config["SECRET_KEY"] = _secret_key

# SECURITY: Require DATABASE_URL to be explicitly set in production
_database_url = os.environ.get("DATABASE_URL")
if not _database_url:
    _db_path = os.path.join(os.path.dirname(__file__), 'instance', 'dashboard.db')
    os.makedirs(os.path.dirname(_db_path), exist_ok=True)
    _database_url = f"sqlite:///{_db_path}"
app.config["SQLALCHEMY_DATABASE_URI"] = _database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# SECURITY: Restrict CORS to specific origins (configure as needed)
_cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
CORS(app, resources={r"/api/*": {"origins": _cors_origins}})

db.init_app(app)

with app.app_context():
    db.create_all()

from api.events import events_bp
from api.projects import projects_bp
from api.issues import issues_bp
from api.sync import sync_bp
from api.artifacts import artifacts_bp
from api.prd_projects import prd_projects_bp

app.register_blueprint(events_bp, url_prefix="/api")
app.register_blueprint(projects_bp, url_prefix="/api")
app.register_blueprint(issues_bp, url_prefix="/api")
app.register_blueprint(sync_bp, url_prefix="/api")
app.register_blueprint(artifacts_bp, url_prefix="/api")
app.register_blueprint(prd_projects_bp, url_prefix="/api")


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify(
        {"success": True, "status": "healthy", "message": "Dashboard API is running"}
    ), 200


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # SECURITY: Validate path to prevent directory traversal
    if path:
        safe_path = safe_join(app.static_folder, path)
        if safe_path and os.path.exists(safe_path):
            return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    # SECURITY: Disable debug mode in production, use FLASK_DEBUG env var
    debug_mode = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=int(os.environ.get("API_PORT", 5001)), debug=debug_mode)
