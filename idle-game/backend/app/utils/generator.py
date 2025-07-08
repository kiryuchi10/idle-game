import random
import math
import json


class MapGenerator:
    def __init__(self, width=800, height=600):
        self.width = width
        self.height = height
        self.grid_size = 20  # For path generation

    def generate_map(self):
        """Generate complete map with buildings, trees, and paths that meet constraints"""
        max_attempts = 10
        for _ in range(max_attempts):
            buildings = self.generate_buildings()
            trees = self.generate_trees(buildings)
            paths = self.generate_paths(buildings, trees)

            if (
                len(buildings) > 1
                and len(trees) >= 1
                and self.is_path_coverage_sufficient(paths["lines"])
            ):
                return {
                    "width": self.width,
                    "height": self.height,
                    "buildings": buildings,
                    "trees": trees,
                    "paths": paths,
                }

        # Fallback empty map
        return {
            "width": self.width,
            "height": self.height,
            "buildings": [],
            "trees": [],
            "paths": {"lines": [], "points": []},
        }

    def is_path_coverage_sufficient(self, lines):
        """Check if path lines cover at least 20% of the area"""
        total_area = self.width * self.height
        path_area = 0
        line_thickness = 10  # approximate thickness in pixels

        for line in lines:
            dx = line["x2"] - line["x1"]
            dy = line["y2"] - line["y1"]
            length = math.sqrt(dx**2 + dy**2)
            path_area += length * line_thickness

        return path_area >= 0.2 * total_area

    def generate_buildings(self):
        """Generate random buildings (rectangles)"""
        buildings = []
        num_buildings = random.randint(8, 15)

        for _ in range(num_buildings):
            width = random.randint(40, 80)
            height = random.randint(40, 80)
            x = random.randint(0, self.width - width)
            y = random.randint(0, self.height - height)

            building = {
                "x": x,
                "y": y,
                "width": width,
                "height": height,
                "color": "#8B4513",  # Brown color
            }

            if not self.check_overlap(building, buildings):
                buildings.append(building)

        return buildings

    def generate_trees(self, buildings):
        """Generate random trees (triangles)"""
        trees = []
        num_trees = random.randint(15, 25)

        for _ in range(num_trees):
            size = random.randint(15, 30)
            x = random.randint(size, self.width - size)
            y = random.randint(size, self.height - size)

            tree = {"x": x, "y": y, "size": size, "color": "#228B22"}  # Green color

            if not self.check_tree_overlap(tree, buildings):
                trees.append(tree)

        return trees

    def generate_paths(self, buildings, trees):
        """Generate yellow path lines connecting different areas"""
        paths = []
        grid = self.create_grid(buildings, trees)
        main_paths = self.generate_main_paths(grid)

        for path_segment in main_paths:
            for i in range(len(path_segment) - 1):
                start = path_segment[i]
                end = path_segment[i + 1]

                start_x = start[0] * self.grid_size + self.grid_size // 2
                start_y = start[1] * self.grid_size + self.grid_size // 2
                end_x = end[0] * self.grid_size + self.grid_size // 2
                end_y = end[1] * self.grid_size + self.grid_size // 2

                paths.append(
                    {
                        "x1": start_x,
                        "y1": start_y,
                        "x2": end_x,
                        "y2": end_y,
                        "color": "#FFD700",  # Gold/Yellow color
                    }
                )

        path_points = self.generate_path_points(paths)

        return {"lines": paths, "points": path_points}

    def create_grid(self, buildings, trees):
        """Create a grid for pathfinding (0 = walkable, 1 = blocked)"""
        grid_width = self.width // self.grid_size
        grid_height = self.height // self.grid_size
        grid = [[0 for _ in range(grid_width)] for _ in range(grid_height)]

        for building in buildings:
            start_x = building["x"] // self.grid_size
            start_y = building["y"] // self.grid_size
            end_x = (building["x"] + building["width"]) // self.grid_size
            end_y = (building["y"] + building["height"]) // self.grid_size

            for y in range(max(0, start_y), min(grid_height, end_y + 1)):
                for x in range(max(0, start_x), min(grid_width, end_x + 1)):
                    grid[y][x] = 1

        for tree in trees:
            grid_x = tree["x"] // self.grid_size
            grid_y = tree["y"] // self.grid_size
            if 0 <= grid_x < grid_width and 0 <= grid_y < grid_height:
                grid[grid_y][grid_x] = 1

        return grid

    def generate_main_paths(self, grid):
        """Generate main connecting paths using simple pathfinding"""
        paths = []
        grid_width = len(grid[0])
        grid_height = len(grid)

        for y in range(2, grid_height - 2, 4):
            path = []
            for x in range(0, grid_width):
                if grid[y][x] == 0:
                    path.append((x, y))
                elif path:
                    if len(path) > 3:
                        paths.append(path)
                    path = []
            if path and len(path) > 3:
                paths.append(path)

        for x in range(2, grid_width - 2, 4):
            path = []
            for y in range(0, grid_height):
                if grid[y][x] == 0:
                    path.append((x, y))
                elif path:
                    if len(path) > 3:
                        paths.append(path)
                    path = []
            if path and len(path) > 3:
                paths.append(path)

        return paths

    def generate_path_points(self, path_lines):
        """Generate discrete points along paths for character movement"""
        points = []

        for line in path_lines:
            points.append({"x": line["x1"], "y": line["y1"]})
            points.append({"x": line["x2"], "y": line["y2"]})

            dx = line["x2"] - line["x1"]
            dy = line["y2"] - line["y1"]
            distance = math.sqrt(dx**2 + dy**2)

            if distance > 40:
                num_points = int(distance // 20)
                for i in range(1, num_points):
                    t = i / num_points
                    x = line["x1"] + t * dx
                    y = line["y1"] + t * dy
                    points.append({"x": x, "y": y})

        unique_points = []
        for point in points:
            is_duplicate = False
            for existing in unique_points:
                if (
                    abs(point["x"] - existing["x"]) < 10
                    and abs(point["y"] - existing["y"]) < 10
                ):
                    is_duplicate = True
                    break
            if not is_duplicate:
                unique_points.append(point)

        return unique_points

    def check_overlap(self, new_building, existing_buildings):
        """Check if new building overlaps with existing ones"""
        for building in existing_buildings:
            if (
                new_building["x"] < building["x"] + building["width"]
                and new_building["x"] + new_building["width"] > building["x"]
                and new_building["y"] < building["y"] + building["height"]
                and new_building["y"] + new_building["height"] > building["y"]
            ):
                return True
        return False

    def check_tree_overlap(self, tree, buildings):
        """Check if tree overlaps with buildings"""
        for building in buildings:
            if (
                tree["x"] - tree["size"] < building["x"] + building["width"]
                and tree["x"] + tree["size"] > building["x"]
                and tree["y"] - tree["size"] < building["y"] + building["height"]
                and tree["y"] + tree["size"] > building["y"]
            ):
                return True
        return False
