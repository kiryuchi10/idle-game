# app/models.py
from app import db
from datetime import datetime
import json
from flask import current_app
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
db = SQLAlchemy()

class GameMap(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    width = db.Column(db.Integer, default=800)
    height = db.Column(db.Integer, default=600)
    buildings = db.Column(db.Text)  # JSON string
    trees = db.Column(db.Text)      # JSON string
    paths = db.Column(db.Text)      # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'width': self.width,
            'height': self.height,
            'buildings': json.loads(self.buildings) if self.buildings else [],
            'trees': json.loads(self.trees) if self.trees else [],
            'paths': json.loads(self.paths) if self.paths else []
        }

class Character(db.Model):
    __tablename__ = 'characters'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    x = db.Column(db.Float, default=100.0)
    y = db.Column(db.Float, default=100.0)
    target_x = db.Column(db.Float, default=100.0)
    target_y = db.Column(db.Float, default=100.0)
    speed = db.Column(db.Float, default=2.0)
    color = db.Column(db.String(7), default='#3498db')
    map_id = db.Column(db.Integer, db.ForeignKey('game_map.id'), default=1)
    last_update = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'role': self.role,
            'x': self.x,
            'y': self.y,
            'target_x': self.target_x,
            'target_y': self.target_y,
            'speed': self.speed,
            'color': self.color,
            'map_id': self.map_id
        }