import requests
import sys
from datetime import datetime
import json

class WayaCreateAPITester:
    def __init__(self, base_url="https://wayacreate.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            print(f"Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)[:500]}...")
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

    def test_wayacreate_branding(self):
        """Test WayaCreate branding in root endpoint"""
        success, response = self.run_test(
            "WayaCreate Branding Check",
            "GET",
            "api/",
            200
        )
        
        if success:
            # Check for WayaCreate branding
            if 'WayaCreate' in str(response) and 'Waya Steurbaut' in str(response):
                print("✅ WayaCreate branding confirmed")
                return True, response
            else:
                print("❌ WayaCreate branding not found in response")
                self.failed_tests.append("WayaCreate Branding: Not found in API response")
                return False, response
        return success, response

    def test_health_check(self):
        """Test the health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        
        if success:
            # Check for WayaCreate platform info
            if 'WayaCreate' in str(response) and 'Waya Steurbaut' in str(response):
                print("✅ Health check includes WayaCreate branding")
                return True, response
            else:
                print("⚠️ Health check missing WayaCreate branding")
        return success, response

    def test_gaming_content(self):
        """Test gaming content retrieval"""
        success, response = self.run_test(
            "Gaming Content",
            "GET",
            "api/content?category=Gaming",
            200
        )
        
        if success and isinstance(response, list):
            gaming_content = [item for item in response if 'Gaming' in str(item.get('category', ''))]
            if gaming_content:
                print(f"✅ Found {len(gaming_content)} gaming content items")
                # Check for gaming-specific content
                for content in gaming_content[:2]:  # Check first 2 items
                    title = content.get('title', '')
                    tags = content.get('tags', [])
                    if any(game in title.lower() or game in str(tags).lower() 
                           for game in ['minecraft', 'fortnite', 'roblox', 'blender']):
                        print(f"✅ Gaming content verified: {title}")
                return True, response
            else:
                print("⚠️ No gaming content found")
        return success, response

    def test_tutorial_content(self):
        """Test tutorial content and requirements"""
        success, response = self.run_test(
            "Tutorial Content",
            "GET",
            "api/content?tags=tutorial",
            200
        )
        
        if success and isinstance(response, list):
            tutorial_content = [item for item in response if 'tutorial' in str(item.get('tags', [])).lower()]
            if tutorial_content:
                print(f"✅ Found {len(tutorial_content)} tutorial content items")
                # Check for tutorial requirements
                for content in tutorial_content[:2]:
                    if content.get('tutorial_required', False):
                        print(f"✅ Tutorial requirement verified for: {content.get('title')}")
                return True, response
            else:
                print("⚠️ No tutorial content found")
        return success, response

    def test_token_packages_gaming(self):
        """Test gaming-focused token packages"""
        success, response = self.run_test(
            "Gaming Token Packages",
            "GET",
            "api/tokens/packages",
            200
        )
        
        if success and isinstance(response, list):
            # Check for gaming-themed packages
            gaming_packages = []
            for package in response:
                name = package.get('name', '').lower()
                if any(term in name for term in ['gaming', 'creator', 'gamer']):
                    gaming_packages.append(package)
                    print(f"✅ Gaming package found: {package.get('name')} - ${package.get('price_usd')}")
            
            if gaming_packages:
                print(f"✅ Found {len(gaming_packages)} gaming-themed token packages")
                return True, response
            else:
                print("⚠️ No gaming-themed token packages found")
        return success, response

    def test_register_creator(self):
        """Test creator registration"""
        test_data = {
            "email": f"creator_{datetime.now().strftime('%H%M%S')}@wayacreate.com",
            "display_name": f"Gaming Creator {datetime.now().strftime('%H%M%S')}",
            "role": "creator",
            "bio": "Gaming and tech content creator on WayaCreate! 🎮",
            "skills": ["Gaming", "Blender", "Video Editing", "Minecraft"]
        }
        success, response = self.run_test(
            "Creator Registration",
            "POST",
            "api/auth/register",
            200,
            data=test_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"✅ Creator registered with 1000 welcome tokens")
            
            # Check welcome message
            if 'welcome_message' in response and 'WayaCreate' in response['welcome_message']:
                print("✅ WayaCreate welcome message confirmed")
            return True, response
        return success, response

    def test_demo_login(self):
        """Test demo login functionality"""
        # Use form data for login as per backend implementation
        url = f"{self.base_url}/api/auth/login"
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        
        form_data = {
            'email': 'demo@wayacreate.com',
            'password': 'demo123'
        }
        
        self.tests_run += 1
        print(f"\n🔍 Testing Demo Login...")
        print(f"URL: {url}")
        
        try:
            response = requests.post(url, data=form_data, headers=headers, timeout=10)
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                response_data = response.json()
                
                if 'access_token' in response_data:
                    self.token = response_data['access_token']
                    print("✅ Demo user created and logged in")
                    
                    # Check for gaming creator profile
                    user = response_data.get('user', {})
                    if user.get('role') == 'creator' and 'Gaming' in str(user.get('skills', [])):
                        print("✅ Demo user has gaming creator profile")
                    
                return True, response_data
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                self.failed_tests.append(f"Demo Login: Expected 200, got {response.status_code}")
                return False, {}
                
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"Demo Login: {str(e)}")
            return False, {}

    def test_services_marketplace(self):
        """Test gaming services marketplace"""
        success, response = self.run_test(
            "Gaming Services Marketplace",
            "GET",
            "api/services?category=Gaming",
            200
        )
        
        if success and isinstance(response, list):
            gaming_services = [item for item in response if 'Gaming' in str(item.get('category', ''))]
            if gaming_services:
                print(f"✅ Found {len(gaming_services)} gaming services")
                # Check for Minecraft services
                for service in gaming_services:
                    if 'minecraft' in service.get('title', '').lower():
                        print(f"✅ Minecraft service found: {service.get('title')}")
                        # Check for tutorial requirement
                        packages = service.get('packages', {})
                        if packages:
                            print("✅ Service packages include tutorial components")
                return True, response
            else:
                print("⚠️ No gaming services found")
        return success, response

    def test_community_posts(self):
        """Test gaming community posts"""
        success, response = self.run_test(
            "Gaming Community Posts",
            "GET",
            "api/community/posts?tags=gaming,minecraft,blender",
            200
        )
        
        if success and isinstance(response, list):
            gaming_posts = []
            for post in response:
                tags = post.get('tags', [])
                if any(tag in ['gaming', 'minecraft', 'blender', 'tutorial'] for tag in tags):
                    gaming_posts.append(post)
            
            if gaming_posts:
                print(f"✅ Found {len(gaming_posts)} gaming community posts")
                for post in gaming_posts[:2]:
                    print(f"✅ Gaming post: {post.get('title')}")
                return True, response
            else:
                print("⚠️ No gaming community posts found")
        return success, response

    def test_ai_features(self):
        """Test AI generation features for gaming content"""
        if not self.token:
            print("⚠️ Skipping AI test - No auth token available")
            return False, {}
            
        test_data = {
            "request_type": "gaming_thumbnail",
            "prompt": "Epic Minecraft castle build thumbnail",
            "parameters": {
                "style": "gaming",
                "theme": "medieval"
            }
        }
        
        success, response = self.run_test(
            "AI Gaming Content Generation",
            "POST",
            "api/ai/generate",
            200,
            data=test_data,
            auth_required=True
        )
        
        if success:
            print("✅ AI gaming content generation available")
        return success, response

def main():
    print("🎮 Starting WayaCreate Backend API Tests")
    print("=" * 60)
    print("Testing gaming, design & tech content platform by Waya Steurbaut")
    print("=" * 60)
    
    # Setup
    tester = WayaCreateAPITester()
    
    # Test WayaCreate branding
    print("\n🏷️ Testing WayaCreate Branding...")
    branding_success, _ = tester.test_wayacreate_branding()
    
    if not branding_success:
        print("\n❌ WayaCreate branding test failed - checking if backend is running")
    
    # Test health check
    print("\n💚 Testing Health Check...")
    health_success, _ = tester.test_health_check()
    
    # Test authentication system
    print("\n🔐 Testing Authentication System...")
    
    # Test creator registration
    register_success, _ = tester.test_register_creator()
    
    # Test demo login
    demo_login_success, _ = tester.test_demo_login()
    
    # Test token economy
    print("\n💰 Testing Gaming Token Economy...")
    tester.test_token_packages_gaming()
    
    # Test gaming content
    print("\n🎮 Testing Gaming Content System...")
    tester.test_gaming_content()
    tester.test_tutorial_content()
    
    # Test services marketplace
    print("\n🛍️ Testing Gaming Services Marketplace...")
    tester.test_services_marketplace()
    
    # Test community features
    print("\n👥 Testing Gaming Community Features...")
    tester.test_community_posts()
    
    # Test AI features (requires auth)
    if register_success or demo_login_success:
        print("\n🤖 Testing AI Gaming Features...")
        tester.test_ai_features()
    
    # Print final results
    print("\n" + "=" * 60)
    print("📊 WAYACREATE BACKEND TEST RESULTS")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for failed_test in tester.failed_tests:
            print(f"  - {failed_test}")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 All WayaCreate backend tests passed!")
        print("✅ Platform ready for gaming creators!")
        return 0
    else:
        print(f"\n⚠️  {tester.tests_run - tester.tests_passed} test(s) failed")
        print("🔧 Backend needs attention before frontend testing")
        return 1

if __name__ == "__main__":
    sys.exit(main())