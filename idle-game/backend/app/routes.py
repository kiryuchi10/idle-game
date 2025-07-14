# app/routes.py
from flask import Blueprint, jsonify, request
from app import db
from app.models import GameMap, Character
from app.utils.generator import MapGenerator
from app.utils.pathfinding import PathFinder
import random
import json 

main = Blueprint('main', __name__)

def is_valid_map(game_map):
    try:
        buildings = json.loads(game_map.buildings or "[]")
        trees = json.loads(game_map.trees or "[]")
        paths = json.loads(game_map.paths or '{"lines": [], "points": []}')
        return (
            buildings and trees and
            paths.get("lines") and len(paths.get("lines", [])) > 0 and
            paths.get("points") and len(paths.get("points", [])) > 0
        )
    except Exception:
        return False

@main.route('/api/map', methods=['GET'])
def get_map():
    game_map = GameMap.query.first()
    if not game_map or not is_valid_map(game_map):
        generator = MapGenerator(800, 600)
        map_data = generator.generate_map()
        if not game_map:
            game_map = GameMap()
            db.session.add(game_map)
        game_map.width = map_data['width']
        game_map.height = map_data['height']
        game_map.buildings = json.dumps(map_data['buildings'])
        game_map.trees = json.dumps(map_data['trees'])
        game_map.paths = json.dumps(map_data['paths'])
        db.session.commit()
    return jsonify(game_map.to_dict())

@main.route('/api/maps', methods=['GET'])
def get_maps():
    maps = GameMap.query.all()
    return jsonify([m.to_dict() for m in maps])

@main.route('/api/characters', methods=['GET'])
def get_characters():
    """Get all characters"""
    characters = Character.query.all()
    return jsonify([char.to_dict() for char in characters])

@main.route('/api/characters', methods=['POST'])
def create_character():
    """Create new character"""
    data = request.get_json()
    map_id = data.get('map_id')
    game_map = GameMap.query.get(map_id)
    if not game_map:
        return jsonify({'error': 'Map not found'}), 400
    
    # Find valid spawn position on path
    if game_map:
        paths = json.loads(game_map.paths)
        point_list = paths.get("points", [])
        if point_list:
            spawn_point = random.choice(point_list)
            x, y = spawn_point['x'], spawn_point['y']
        else:
            x, y = 100, 100
    else:
        x, y = 100, 100
    
    character = Character()
    character.name = data.get('name', f'Character{random.randint(1, 1000)}')
    character.role = data.get('role', 'Worker')
    character.x = x
    character.y = y
    character.target_x = x
    character.target_y = y
    character.color = data.get('color', f'#{random.randint(0, 0xFFFFFF):06x}')
    character.map_id = game_map.id
    
    db.session.add(character)
    db.session.commit()
    
    return jsonify(character.to_dict())

@main.route('/api/characters/<int:character_id>/move', methods=['POST'])
def move_character(character_id):
    """Move character to new position"""
    data = request.get_json()
    character = Character.query.get_or_404(character_id)
    
    target_x = data.get('target_x', character.x)
    target_y = data.get('target_y', character.y)
    
    # Check if target position is valid (on path, not colliding)
    game_map = GameMap.query.first()
    if game_map:
        pathfinder = PathFinder(game_map)
        if pathfinder.is_valid_position(target_x, target_y):
            character.target_x = target_x
            character.target_y = target_y
            db.session.commit()
            return jsonify(character.to_dict())
    
    return jsonify({'error': 'Invalid position'}), 400

@main.route('/api/characters/update', methods=['POST'])
def update_characters():
    """Update all character positions (called by frontend periodically)"""
    characters = Character.query.all()
    
    for char in characters:
        # Move character towards target
        dx = char.target_x - char.x
        dy = char.target_y - char.y
        distance = (dx**2 + dy**2)**0.5
        
        if distance > char.speed:
            char.x += (dx / distance) * char.speed
            char.y += (dy / distance) * char.speed
        else:
            char.x = char.target_x
            char.y = char.target_y
            
            # Set new random target when reached
            game_map = GameMap.query.first()
            if game_map:
                paths = json.loads(game_map.paths)
                if paths:
                    point_list = paths.get("points", [])
                    if point_list:
                        new_target = random.choice(point_list)
                        char.target_x = new_target["x"]
                        char.target_y = new_target["y"]
                    else:
                        # Fallback: don't change target, or set to a default
                        char.target_x = char.x
                        char.target_y = char.y
    
    db.session.commit()
    return jsonify([char.to_dict() for char in characters])

from flask import jsonify
import threading
import time

# Put this line at the top or near the imports
progress_state = {"progress": 0}

@main.route("/api/start-process")
def start_process():
    def simulate():
        for i in range(101):
            progress_state["progress"] = i
            time.sleep(0.03)  # Simulate real backend task
    threading.Thread(target=simulate).start()
    return jsonify({"status": "started"})

@main.route("/api/progress")
def get_progress():
    return jsonify(progress=progress_state["progress"])