# test_backend.py - Backend Testing Script
import requests
import json
import time

API_BASE_URL = "http://localhost:5000"

def test_map_generation():
    """Test map generation API"""
    print("Testing map generation...")
    response = requests.get(f"{API_BASE_URL}/api/map")
    
    if response.status_code == 200:
        map_data = response.json()
        print(f"✅ Map generated successfully")
        print(f"   - Size: {map_data['width']}x{map_data['height']}")
        print(f"   - Buildings: {len(map_data['buildings'])}")
        print(f"   - Trees: {len(map_data['trees'])}")
        print(f"   - Path points: {len(map_data['paths']['points'])}")
        return map_data
    else:
        print(f"❌ Map generation failed: {response.status_code}")
        return None

def test_character_creation():
    """Test character creation API"""
    print("\nTesting character creation...")
    
    # First, get the available maps
    maps = requests.get('http://localhost:5000/api/maps').json()
    assert maps, "No maps found in the database!"
    map_id = int(maps[0]['id'])  # Use the first map's id

    print("Available maps:", maps)
    print("Using map_id:", map_id)

    # Now, create a character with the correct map_id
    character_data = {
        "name": "TestChar",
        "role": "Worker",
        "color": "#3498db",
        "map_id": map_id
    }
    resp = requests.post('http://localhost:5000/api/characters', json=character_data)
    print(resp.status_code, resp.text)
    if resp.status_code == 200:
        return [resp.json()]  # Return as a list for compatibility
    else:
        return []

def test_character_movement(characters):
    """Test character movement API"""
    print("\nTesting character movement...")
    
    for character in characters:
        # Test movement to random position
        target_x = character['x'] + 50
        target_y = character['y'] + 50
        
        response = requests.post(f"{API_BASE_URL}/api/characters/{character['id']}/move",
                               json={"target_x": target_x, "target_y": target_y})
        
        if response.status_code == 200:
            updated_char = response.json()
            print(f"✅ {character['name']} movement command sent")
            print(f"   - Target: ({updated_char['target_x']}, {updated_char['target_y']})")
        else:
            print(f"❌ Movement failed for {character['name']}: {response.status_code}")

def test_collision_detection():
    """Test collision detection system"""
    print("\nTesting collision detection...")
    
    # Get map data to find obstacles
    map_response = requests.get(f"{API_BASE_URL}/api/map")
    if map_response.status_code != 200:
        print("❌ Could not get map data for collision testing")
        return
    
    map_data = map_response.json()
    
    # Test movement to building location (should fail)
    if map_data['buildings']:
        building = map_data['buildings'][0]
        test_x = building['x'] + building['width'] // 2
        test_y = building['y'] + building['height'] // 2
        
        # Create test character
        char_response = requests.post(f"{API_BASE_URL}/api/characters",
                                    json={"name": "CollisionTest", "role": "Tester"})
        
        if char_response.status_code == 200:
            test_char = char_response.json()
            
            # Try to move into building
            move_response = requests.post(f"{API_BASE_URL}/api/characters/{test_char['id']}/move",
                                        json={"target_x": test_x, "target_y": test_y})
            
            if move_response.status_code == 400:
                print("✅ Collision detection working - movement blocked")
            else:
                print("❌ Collision detection failed - movement allowed into building")

def test_character_updates():
    """Test character position updates"""
    print("\nTesting character updates...")
    
    # Update all characters
    response = requests.post(f"{API_BASE_URL}/api/characters/update")
    
    if response.status_code == 200:
        characters = response.json()
        print(f"✅ Updated {len(characters)} characters")
        
        for char in characters:
            print(f"   - {char['name']}: ({char['x']:.1f}, {char['y']:.1f}) → "
                  f"({char['target_x']:.1f}, {char['target_y']:.1f})")
    else:
        print(f"❌ Character update failed: {response.status_code}")

def run_all_tests():
    """Run all backend tests"""
    print("🚀 Starting Backend API Tests\n")
    
    # Test map generation
    map_data = test_map_generation()
    if not map_data:
        print("❌ Map generation failed, stopping tests")
        return
    
    # Test character creation
    characters = test_character_creation()
    if not characters:
        print("❌ Character creation failed, stopping tests")
        return
    
    # Test character movement
    test_character_movement(characters)
    
    # Test collision detection
    test_collision_detection()
    
    # Test character updates (simulate game loop)
    print("\nSimulating game loop...")
    for i in range(5):
        print(f"Update {i+1}/5")
        test_character_updates()
        time.sleep(1)
    
    print("\n🎉 All tests completed!")

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server.")
        print("Make sure Flask server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")