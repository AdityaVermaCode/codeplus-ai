import base64
import os
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

# Enable CORS so Next.js frontend can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "CodePulse AI Backend is running!"}


@app.post("/api/audit")
async def audit_code_or_diagram(file: UploadFile = File(...)):
    try:
        # Read the uploaded image/file bytes
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode("utf-8")

        # LM Studio local endpoint
        lm_studio_url = "http://localhost:1234/v1/chat/completions"

        payload = {
            "model": "gemma-4-e4b",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are CodePulse AI, an expert code and security"
                        " auditor. Analyze the provided architecture diagram or"
                        " code screenshot. Return a JSON-like analysis with"
                        " identified risks (High/Medium/Low) and a suggested"
                        " fix or patch."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Audit this architecture diagram or code snippet"
                                " for security vulnerabilities:"
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            },
                        },
                    ],
                },
            ],
            "temperature": 0.7,
        }

        response = requests.post(lm_studio_url, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"LM Studio Error: {response.text}",
            )

        result = response.json()
        ai_message = result["choices"][0]["message"]["content"]

        return {"status": "success", "audit_report": ai_message}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))