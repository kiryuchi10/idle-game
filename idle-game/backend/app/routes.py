# app/routes.py
from flask import Blueprint, jsonify, request
from app.models import GameMap, Character, db
from app.utils.generator import MapGenerator
from app.utils.pathfinding import PathFinder
import random
import json 

main = Blueprint('main', __name__)

@main.route('/api/map', methods=['GET'])
def get_map():
    """Get current map or generate new one"""
    game_map = GameMap.query.first()
    
    if not game_map:
        # Generate new map
        generator = MapGenerator(800, 600)
        map_data = generator.generate_map()
        
        game_map = GameMap(
            width=map_data['width'],
            height=map_data['height'],
            buildings=json.dumps(map_data['buildings']),
            trees=json.dumps(map_data['trees']),
            paths=json.dumps(map_data['paths'])
        )
        db.session.add(game_map)
        db.session.commit()
    
    return jsonify(game_map.to_dict())

@main.route('/api/characters', methods=['GET'])
def get_characters():
    """Get all characters"""
    characters = Character.query.all()
    return jsonify([char.to_dict() for char in characters])

@main.route('/api/characters', methods=['POST'])
def create_character():
    """Create new character"""
    data = request.get_json()
    
    # Find valid spawn position on path
    game_map = GameMap.query.first()
    if game_map:
        paths = json.loads(game_map.paths)
        if paths:
            spawn_point = random.choice(paths)
            x, y = spawn_point['x'], spawn_point['y']
        else:
            x, y = 100, 100
    else:
        x, y = 100, 100
    
    character = Character(
        name=data.get('name', f'Character{random.randint(1, 1000)}'),
        role=data.get('role', 'Worker'),
        x=x,
        y=y,
        target_x=x,
        target_y=y,
        color=data.get('color', f'#{random.randint(0, 0xFFFFFF):06x}')
    )
    
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
                    new_target = random.choice(paths)
                    char.target_x = new_target['x']
                    char.target_y = new_target['y']
    
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