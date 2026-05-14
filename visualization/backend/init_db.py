import os
from app import app, db

DB_PATH = os.path.join(os.path.dirname(__file__), 'instance', 'dashboard.db')

if __name__ == "__main__":
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with app.app_context():
        db.create_all()
        print("Database tables verified/created successfully!")
