import os
import requests

print("🚀 [Antigravity Engine] Initializing system diagnostics...")

# Check Backend
try:
    be_res = requests.get("http://localhost:8000/", timeout=2)
    if be_res.status_code == 200:
        print("✅ FastAPI Backend: ONLINE (Port 8000)")
    else:
        print("⚠️ FastAPI Backend responded with status:", be_res.status_code)
except Exception:
    print("❌ FastAPI Backend: OFFLINE")

# Check LM Studio / Gemma 4
try:
    lms_res = requests.get("http://localhost:1234/v1/models", timeout=2)
    if lms_res.status_code == 200:
        print("✅ Local LM Studio (Gemma 4): ONLINE (Port 1234)")
    else:
        print("⚠️ LM Studio responded with status:", lms_res.status_code)
except Exception:
    print("❌ Local LM Studio: OFFLINE (Check if server is started)")

print(
    "✨ [Antigravity Engine] Optimization & Multi-Layer Fallback Sequence"
    " Ready."
)