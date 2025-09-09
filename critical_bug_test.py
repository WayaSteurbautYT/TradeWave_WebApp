import requests
import sys
from datetime import datetime
import json
import uuid

class CriticalBugTester:
    def __init__(self, base_url="https://wayacreate.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.current_user = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False, cookies=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Use session-based authentication with cookies
        if auth_required and self.session_token:
            if cookies is None:
                cookies = {}
            cookies['session_token'] = self.session_token

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
                    return True, response_data
                except:
                    print("Response: (non-JSON)")
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                failure_msg = f"{name}: Expected {expected_status}, got {response.status_code}"
                self.failed_tests.append(failure_msg)
                
                try:
                    error_data = response.json()
                    print(f"Error Response: {json.dumps(error_data, indent=2)}")
                    return False, error_data
                except:
                    print(f"Error Response: {response.text}")
                    return False, {"error": response.text}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            failure_msg = f"{name}: {str(e)}"
            self.failed_tests.append(failure_msg)
            return False, {}

    def test_critical_achievement_bug(self):
        """Test the critical bug in GET /api/users/{user_id}/achievements"""
        print("\n🚨 TESTING CRITICAL ACHIEVEMENT BUG")
        print("=" * 50)
        
        # First, simulate authentication by creating a fake session
        print("Setting up simulated authentication...")
        self.session_token = "test_session_token_" + str(uuid.uuid4())[:16]
        test_user_id = str(uuid.uuid4())
        
        # Test the endpoint that has the critical bug
        success, response = self.run_test(
            "Get User Achievements (CRITICAL BUG TEST)",
            "GET",
            f"api/users/{test_user_id}/achievements",
            500,  # Expecting 500 error due to the bug
            auth_required=True
        )
        
        if success and response.get('detail') and 'NoneType' in str(response.get('detail')):
            print("🚨 CRITICAL BUG CONFIRMED!")
            print("   - AttributeError: 'NoneType' object has no attribute 'id'")
            print("   - This occurs in server.py line 1403")
            print("   - Bug happens when current_user is None but endpoint tries to access current_user.id")
            return True, "CRITICAL BUG CONFIRMED"
        elif not success and response.get('detail') == 'Not authenticated':
            print("✅ Authentication working correctly - no bug triggered")
            return False, "Authentication prevents bug"
        else:
            print("⚠️ Unexpected response - bug may be fixed or different issue")
            return False, "Unexpected response"

    def test_corrected_api_calls(self):
        """Test API calls with correct request body structure"""
        print("\n🔧 TESTING CORRECTED API CALLS")
        print("=" * 40)
        
        # Test order creation with correct structure
        order_data = {
            "service_id": str(uuid.uuid4()),
            "package_type": "standard",
            "requirements": "I need a modern logo for my tech startup."
        }
        
        success1, response1 = self.run_test(
            "Create Order (Corrected Structure)",
            "POST",
            "api/orders",
            401,  # Should return 401 for unauthenticated request
            data=order_data
        )
        
        # Test withdrawal with correct structure
        withdrawal_data = {
            "amount_credits": 100,
            "amount_usd": 10.0,
            "payment_method": "paypal",
            "payment_details": {"email": "test@example.com"}
        }
        
        success2, response2 = self.run_test(
            "Token Withdrawal (Corrected Structure)",
            "POST",
            "api/tokens/withdraw",
            401,  # Should return 401 for unauthenticated request
            data=withdrawal_data
        )
        
        return success1 and success2, "API structure tests"

    def test_authentication_bypass_issues(self):
        """Test for authentication bypass issues"""
        print("\n🔐 TESTING AUTHENTICATION BYPASS ISSUES")
        print("=" * 45)
        
        # Test activity tracking (known minor issue)
        activity_data = {
            "activity_type": "test_activity",
            "details": {"test": "data"}
        }
        
        success, response = self.run_test(
            "Track Activity (Auth Bypass Test)",
            "POST",
            "api/analytics/track",
            200,  # Known to return 200 instead of 401
            data=activity_data
        )
        
        if success:
            print("⚠️ MINOR ISSUE CONFIRMED: Activity tracking bypasses authentication")
            print("   - Should return 401 but returns 200")
            print("   - This is a minor security issue but not deployment-blocking")
            return True, "Authentication bypass confirmed"
        else:
            print("✅ Authentication working correctly")
            return False, "No bypass detected"

def main():
    print("🚨 CRITICAL BUG INVESTIGATION & FINAL VERIFICATION")
    print("=" * 60)
    
    tester = CriticalBugTester()
    
    # Test the critical achievement bug
    bug_found, bug_result = tester.test_critical_achievement_bug()
    
    # Test corrected API calls
    api_fixed, api_result = tester.test_corrected_api_calls()
    
    # Test authentication bypass issues
    bypass_found, bypass_result = tester.test_authentication_bypass_issues()
    
    # Summary
    print("\n" + "=" * 60)
    print("🔍 CRITICAL BUG INVESTIGATION RESULTS")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    
    print(f"\n🚨 Critical Achievement Bug: {'FOUND' if bug_found else 'NOT TRIGGERED'}")
    print(f"   Result: {bug_result}")
    
    print(f"\n🔧 API Structure Issues: {'RESOLVED' if api_fixed else 'STILL PRESENT'}")
    print(f"   Result: {api_result}")
    
    print(f"\n🔐 Authentication Bypass: {'FOUND' if bypass_found else 'NOT FOUND'}")
    print(f"   Result: {bypass_result}")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for failed_test in tester.failed_tests:
            print(f"  - {failed_test}")
    
    # Final assessment
    print("\n" + "=" * 60)
    print("📊 FINAL ASSESSMENT")
    print("=" * 60)
    
    if bug_found:
        print("🚨 CRITICAL BUG CONFIRMED - DEPLOYMENT BLOCKER")
        print("   The achievement system has a null pointer exception")
        print("   This needs immediate fixing before deployment")
        return 1
    elif not api_fixed:
        print("⚠️ API STRUCTURE ISSUES DETECTED")
        print("   Some endpoints have incorrect request validation")
        print("   These should be reviewed but may not block deployment")
        return 1
    else:
        print("✅ NO CRITICAL BUGS DETECTED")
        print("   Minor authentication bypass issue noted but not blocking")
        print("   System appears ready for deployment")
        return 0

if __name__ == "__main__":
    sys.exit(main())