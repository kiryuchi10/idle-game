# app/utils/pathfinding.py
import math
import json

class PathFinder:
    def __init__(self, game_map):
        self.game_map = game_map
        self.buildings = json.loads(game_map.buildings) if game_map.buildings else []
        self.trees = json.loads(game_map.trees) if game_map.trees else []
        self.paths = json.loads(game_map.paths) if game_map.paths else {'points': []}
    
    def is_valid_position(self, x, y):
        """Check if position is valid (on path and not colliding)"""
        # Check if position is on a path point
        if not self.is_on_path(x, y):
            return False
        
        # Check collision with buildings
        if self.collides_with_buildings(x, y):
            return False
        
        # Check collision with trees
        if self.collides_with_trees(x, y):
            return False
        
        return True
    
    def is_on_path(self, x, y, tolerance=30):
        """Check if position is near a path point"""
        if not self.paths.get('points'):
            return True  # If no paths defined, allow movement anywhere
        
        for point in self.paths['points']:
            distance = math.sqrt((x - point['x'])**2 + (y - point['y'])**2)
            if distance <= tolerance:
                return True
        return False
    
    def collides_with_buildings(self, x, y, character_radius=15):
        """Check if character collides with any building"""
        for building in self.buildings:
            if (x - character_radius < building['x'] + building['width'] and
                x + character_radius > building['x'] and
                y - character_radius < building['y'] + building['height'] and
                y + character_radius > building['y']):
                return True
        return False
    
    def collides_with_trees(self, x, y, character_radius=15):
        """Check if character collides with any tree"""
        for tree in self.trees:
            distance = math.sqrt((x - tree['x'])**2 + (y - tree['y'])**2)
            if distance < tree['size'] + character_radius:
                return True
        return False
    
    def find_nearest_path_point(self, x, y):
        """Find the nearest valid path point"""
        if not self.paths.get('points'):
            return {'x': x, 'y': y}
        
        nearest_point = self.paths['points'][0]
        min_distance = float('inf')
        
        for point in self.paths['points']:
            distance = math.sqrt((x - point['x'])**2 + (y - point['y'])**2)
            if distance < min_distance:
                min_distance = distance
                nearest_point = point
        
        return nearest_point