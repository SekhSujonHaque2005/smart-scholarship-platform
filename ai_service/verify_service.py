import httpx
import sys

def verify():
    base_url = "http://localhost:8000"
    
    print(f"--- Verifying AI Service at {base_url} ---")
    
    with httpx.Client(timeout=10.0) as client:
        # 1. Health Check
        try:
            r = client.get(f"{base_url}/health")
            print(f"[Health] Status: {r.status_code}, Response: {r.json()}")
        except Exception as e:
            print(f"[Health] FAILED: {e}")

        # 2. Root
        try:
            r = client.get(f"{base_url}/")
            print(f"[Root] Status: {r.status_code}")
        except Exception as e:
            print(f"[Root] FAILED: {e}")

        # 3. Fraud Check (The logic we fixed)
        try:
            payload = {
                "applicationId": "app_123",
                "studentId": "student_456",
                "scholarshipId": "scholar_789",
                "formData": {
                    "annualIncome": 1200000,
                    "name": "Test User",
                    "email": "test@example.com",
                    "phone": "1234567890",
                    "cgpa": 9.5
                }
            }
            r = client.post(f"{base_url}/api/fraud/check", json=payload)
            print(f"[Fraud Check] Status: {r.status_code}")
            if r.status_code == 200:
                print(f"Response: {r.json()}")
            else:
                print(f"Error: {r.text}")
        except Exception as e:
            print(f"[Fraud Check] FAILED: {e}")

if __name__ == "__main__":
    verify()
