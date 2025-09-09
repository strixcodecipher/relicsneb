import requests
import sys
from datetime import datetime

class NebulaTrackerAPITester:
    def __init__(self, base_url="https://nebula-spawns.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}" if endpoint else f"{self.base_url}/api"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {response_data}")
                except:
                    print(f"Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:200]}...")

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_spawn_prediction(self):
        """Test spawn prediction endpoint"""
        success, response = self.run_test("Spawn Prediction", "GET", "spawn-prediction", 200)
        
        if success:
            # Validate response structure
            required_fields = ['current_spawns', 'next_spawns', 'time_to_next', 'current_color_set', 'server_time']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                print(f"⚠️  Warning: Missing fields in response: {missing_fields}")
            else:
                print("✅ Response structure is valid")
        
        return success, response

    def test_status_endpoints(self):
        """Test status check endpoints"""
        # Test POST status
        test_data = {"client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"}
        post_success, post_response = self.run_test("Create Status Check", "POST", "status", 200, test_data)
        
        # Test GET status
        get_success, get_response = self.run_test("Get Status Checks", "GET", "status", 200)
        
        return post_success and get_success

def main():
    print("🚀 Starting Nebula Relics Tracker API Tests")
    print("=" * 50)
    
    tester = NebulaTrackerAPITester()
    
    # Run all tests
    tester.test_root_endpoint()
    tester.test_health_check()
    tester.test_spawn_prediction()
    tester.test_status_endpoints()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend API tests passed!")
        return 0
    else:
        print("❌ Some backend API tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())