import requests
import sys
from datetime import datetime
import json
import uuid
import time

class WayaCreateAPITester:
    def __init__(self, base_url="https://wayacreate.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.critical_failures = []

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False, cookies=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, cookies=cookies, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, cookies=cookies, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, cookies=cookies, timeout=15)

            print(f"Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)[:500]}...")
                    return True, response_data, response
                except:
                    print("Response: (non-JSON)")
                    return True, response.text, response
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                failure_msg = f"{name}: Expected {expected_status}, got {response.status_code}"
                self.failed_tests.append(failure_msg)
                
                # Mark as critical if it's a core functionality
                if any(keyword in name.lower() for keyword in ['auth', 'login', 'database', 'health']):
                    self.critical_failures.append(failure_msg)
                
                try:
                    error_data = response.json()
                    print(f"Error Response: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"Error Response: {response.text}")
                return False, {}, response

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            failure_msg = f"{name}: Request timeout"
            self.failed_tests.append(failure_msg)
            self.critical_failures.append(failure_msg)
            return False, {}, None
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            failure_msg = f"{name}: Connection error"
            self.failed_tests.append(failure_msg)
            self.critical_failures.append(failure_msg)
            return False, {}, None
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            failure_msg = f"{name}: {str(e)}"
            self.failed_tests.append(failure_msg)
            return False, {}, None

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )

    def test_health_check(self):
        """Test the health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )

    def test_database_connection(self):
        """Test database connectivity through health endpoint"""
        success, response_data, _ = self.test_health_check()
        if success and isinstance(response_data, dict):
            if 'status' in response_data and response_data['status'] == 'healthy':
                print("✅ Database connection appears healthy")
                return True
            else:
                print("❌ Database connection may have issues")
                self.critical_failures.append("Database: Health check indicates issues")
                return False
        return False

    def test_google_oauth_simulation(self):
        """Test Google OAuth simulation with Emergent Agent login"""
        # Generate a test session ID
        test_session_id = str(uuid.uuid4())
        
        success, response_data, response = self.run_test(
            "Google OAuth (Emergent Agent Login)",
            "POST",
            "api/auth/emergentagent-login",
            200,
            data={"session_id": test_session_id}
        )
        
        if success and isinstance(response_data, dict):
            if 'user' in response_data:
                self.user_id = response_data['user'].get('id')
                print(f"✅ User created/logged in with ID: {self.user_id}")
                
                # Extract session token from cookies if available
                if response and response.cookies:
                    session_cookie = response.cookies.get('session_token')
                    if session_cookie:
                        self.session_token = session_cookie
                        print(f"✅ Session token obtained from cookie")
                
                return True, response_data
        
        return success, response_data

    def test_get_current_user(self):
        """Test getting current user profile"""
        if not self.session_token:
            print("⚠️ Skipping - No session token available")
            return False, {}
            
        cookies = {'session_token': self.session_token} if self.session_token else None
        
        return self.run_test(
            "Get Current User Profile",
            "GET",
            "api/auth/me",
            200,
            cookies=cookies
        )

    def test_logout(self):
        """Test user logout"""
        if not self.session_token:
            print("⚠️ Skipping - No session token available")
            return False, {}
            
        cookies = {'session_token': self.session_token} if self.session_token else None
        
        return self.run_test(
            "User Logout",
            "POST",
            "api/auth/logout",
            200,
            cookies=cookies
        )

    def test_subscription_plans(self):
        """Test getting subscription plans (token packages equivalent)"""
        return self.run_test(
            "Get Subscription Plans",
            "GET",
            "api/subscriptions/plans",
            200
        )

    def test_create_subscription(self):
        """Test creating a subscription (Stripe integration)"""
        if not self.session_token:
            print("⚠️ Skipping - No session token available")
            return False, {}
            
        cookies = {'session_token': self.session_token} if self.session_token else None
        
        # Test with creator plan
        test_data = {
            "plan_id": "creator"
        }
        
        return self.run_test(
            "Create Subscription (Stripe Integration)",
            "POST",
            "api/subscriptions/subscribe",
            200,
            data=test_data,
            cookies=cookies
        )

    def test_ai_generation(self):
        """Test AI content generation with Gemini"""
        if not self.session_token:
            print("⚠️ Skipping - No session token available")
            return False, {}
            
        cookies = {'session_token': self.session_token} if self.session_token else None
        
        test_data = {
            "request_type": "text_generation",
            "prompt": "Create a simple gaming tutorial introduction",
            "parameters": {}
        }
        
        return self.run_test(
            "AI Content Generation (Gemini 2.0 Flash)",
            "POST",
            "api/ai/generate",
            200,
            data=test_data,
            cookies=cookies
        )

    def test_youtube_import(self):
        """Test YouTube content import"""
        if not self.session_token:
            print("⚠️ Skipping - No session token available")
            return False, {}
            
        cookies = {'session_token': self.session_token} if self.session_token else None
        
        test_data = {
            "channel_url": "https://www.youtube.com/@wayasteurbaut",
            "import_types": ["videos"],
            "max_items": 5
        }
        
        return self.run_test(
            "YouTube Content Import",
            "POST",
            "api/import/youtube",
            200,
            data=test_data,
            cookies=cookies
        )

    def test_content_system(self):
        """Test content CRUD operations"""
        # Test getting content list
        success, _, _ = self.run_test(
            "Get Content List",
            "GET",
            "api/content",
            200
        )
        
        if not success:
            return False
        
        # Test creating content (requires auth)
        if not self.session_token:
            print("⚠️ Skipping content creation - No session token available")
            return success
            
        cookies = {'session_token': self.session_token} if self.session_token else None
        
        test_data = {
            "title": f"Test Gaming Tutorial {datetime.now().strftime('%H%M%S')}",
            "description": "A comprehensive gaming tutorial for WayaCreate platform",
            "content_type": "video",
            "price": 50,
            "download_price": 25,
            "tags": ["gaming", "tutorial", "wayacreate"],
            "category": "Gaming",
            "rights": ["view", "download"],
            "tutorial_url": "https://example.com/tutorial",
            "project_files": ["https://example.com/project.zip"]
        }
        
        create_success, _, _ = self.run_test(
            "Create Content with Tutorial",
            "POST",
            "api/content",
            200,
            data=test_data,
            cookies=cookies
        )
        
        return success and create_success

    def test_rating_system(self):
        """Test rating/review system"""
        if not self.session_token or not self.user_id:
            print("⚠️ Skipping - No session token or user ID available")
            return False
            
        cookies = {'session_token': self.session_token} if self.session_token else None
        
        # Create a test rating
        test_data = {
            "reviewee_id": self.user_id,  # Self-rating for test
            "rating_type": "user",
            "rating": 5,
            "comment": "Test rating for WayaCreate platform"
        }
        
        return self.run_test(
            "Create Rating/Review",
            "POST",
            "api/ratings",
            200,
            data=test_data,
            cookies=cookies
        )

    def test_cors_configuration(self):
        """Test CORS configuration"""
        url = f"{self.base_url}/api/"
        print(f"\n🔍 Testing CORS Configuration...")
        
        try:
            response = requests.options(url, headers={
                'Origin': 'https://wayacreate.preview.emergentagent.com',
                'Access-Control-Request-Method': 'GET'
            }, timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
            }
            
            print(f"CORS Headers: {json.dumps(cors_headers, indent=2)}")
            
            if cors_headers['Access-Control-Allow-Origin']:
                print("✅ CORS is properly configured")
                self.tests_passed += 1
                return True
            else:
                print("❌ CORS headers not found or misconfigured")
                self.failed_tests.append("CORS: Headers not found or misconfigured")
                return False
                
        except Exception as e:
            print(f"❌ CORS test failed: {str(e)}")
            self.failed_tests.append(f"CORS: {str(e)}")
            return False
        finally:
            self.tests_run += 1

def main():
    print("🚀 Starting WayaCreate Backend API Tests")
    print("=" * 60)
    
    # Setup
    tester = WayaCreateAPITester()
    
    # Test 1: Basic connectivity and health
    print("\n📡 Testing Basic API Connectivity & Health...")
    root_success, _, _ = tester.test_root_endpoint()
    
    if not root_success:
        print("\n❌ CRITICAL: Root API endpoint failed - backend may not be running")
        print("Please check if the backend service is running and accessible")
        return 1
    
    health_success, _, _ = tester.test_health_check()
    db_success = tester.test_database_connection()
    
    # Test 2: Authentication System
    print("\n🔐 Testing Authentication System...")
    auth_success, auth_data = tester.test_google_oauth_simulation()
    
    if auth_success:
        # Test getting current user profile
        profile_success, _, _ = tester.test_get_current_user()
        
        # Test logout
        logout_success, _, _ = tester.test_logout()
    else:
        print("⚠️ Authentication failed - skipping dependent tests")
    
    # Test 3: Token/Subscription System
    print("\n💰 Testing Token/Subscription System...")
    plans_success, _, _ = tester.test_subscription_plans()
    
    if auth_success:
        # Test Stripe integration
        stripe_success, _, _ = tester.test_create_subscription()
    
    # Test 4: AI Generation System
    print("\n🤖 Testing AI Generation System...")
    if auth_success:
        ai_success, _, _ = tester.test_ai_generation()
    
    # Test 5: YouTube Import System
    print("\n📺 Testing YouTube Import System...")
    if auth_success:
        youtube_success, _, _ = tester.test_youtube_import()
    
    # Test 6: Content System
    print("\n📝 Testing Content System...")
    content_success = tester.test_content_system()
    
    # Test 7: Rating System
    print("\n⭐ Testing Rating System...")
    if auth_success:
        rating_success, _, _ = tester.test_rating_system()
    
    # Test 8: CORS Configuration
    print("\n🌐 Testing CORS Configuration...")
    cors_success = tester.test_cors_configuration()
    
    # Print final results
    print("\n" + "=" * 60)
    print("📊 WAYACREATE BACKEND TEST RESULTS")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    
    if tester.critical_failures:
        print("\n🚨 CRITICAL FAILURES (Block Core Functionality):")
        for critical_failure in tester.critical_failures:
            print(f"  - {critical_failure}")
    
    if tester.failed_tests:
        print("\n❌ ALL FAILED TESTS:")
        for failed_test in tester.failed_tests:
            print(f"  - {failed_test}")
    
    # Success criteria
    critical_tests_passed = len(tester.critical_failures) == 0
    overall_success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    
    print(f"\n📈 Success Rate: {overall_success_rate:.1f}%")
    
    if critical_tests_passed and overall_success_rate >= 70:
        print("\n🎉 WayaCreate backend is functioning well!")
        return 0
    elif critical_tests_passed:
        print(f"\n⚠️ Backend is functional but has some issues ({tester.tests_run - tester.tests_passed} non-critical failures)")
        return 0
    else:
        print(f"\n💥 Critical backend issues detected - immediate attention required!")
        return 1

if __name__ == "__main__":
    sys.exit(main())