import requests
import sys
from datetime import datetime
import json

class TradeWaveAPITester:
    def __init__(self, base_url="https://shadcn-integration.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            print(f"Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    print("Response: (non-JSON)")
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error Response: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"Error Response: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            self.failed_tests.append(f"{name}: Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            self.failed_tests.append(f"{name}: Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )

    def test_create_status_check(self):
        """Test creating a status check"""
        test_data = {
            "client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"
        }
        success, response = self.run_test(
            "Create Status Check",
            "POST",
            "api/status",
            200,
            data=test_data
        )
        return success, response.get('id') if success else None

    def test_get_status_checks(self):
        """Test getting all status checks"""
        return self.run_test(
            "Get Status Checks",
            "GET",
            "api/status",
            200
        )

    def test_cors_headers(self):
        """Test CORS configuration"""
        url = f"{self.base_url}/api/"
        print(f"\n🔍 Testing CORS Headers...")
        
        try:
            response = requests.options(url, headers={
                'Origin': 'https://shadcn-integration.preview.emergentagent.com',
                'Access-Control-Request-Method': 'GET'
            }, timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            print(f"CORS Headers: {json.dumps(cors_headers, indent=2)}")
            
            if cors_headers['Access-Control-Allow-Origin']:
                print("✅ CORS is configured")
                self.tests_passed += 1
                return True
            else:
                print("❌ CORS headers not found")
                self.failed_tests.append("CORS: Headers not found")
                return False
                
        except Exception as e:
            print(f"❌ CORS test failed: {str(e)}")
            self.failed_tests.append(f"CORS: {str(e)}")
            return False
        finally:
            self.tests_run += 1

def main():
    print("🚀 Starting TradeWave Backend API Tests")
    print("=" * 50)
    
    # Setup
    tester = TradeWaveAPITester()
    
    # Test basic connectivity
    print("\n📡 Testing Basic API Connectivity...")
    root_success, _ = tester.test_root_endpoint()
    
    if not root_success:
        print("\n❌ Root API endpoint failed - backend may not be running")
        print("Please check if the backend service is running and accessible")
        return 1
    
    # Test CRUD operations
    print("\n📝 Testing CRUD Operations...")
    create_success, status_id = tester.test_create_status_check()
    
    if create_success:
        print(f"Created status check with ID: {status_id}")
    
    # Test getting status checks
    get_success, _ = tester.test_get_status_checks()
    
    # Test CORS
    print("\n🌐 Testing CORS Configuration...")
    tester.test_cors_headers()
    
    # Print final results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for failed_test in tester.failed_tests:
            print(f"  - {failed_test}")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 All backend tests passed!")
        return 0
    else:
        print(f"\n⚠️  {tester.tests_run - tester.tests_passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())