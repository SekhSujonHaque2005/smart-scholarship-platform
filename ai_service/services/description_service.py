import httpx
import os
import asyncio
import logging

logger = logging.getLogger(__name__)

HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
# Use HuggingFace Inference Providers (OpenAI-compatible router)
HF_MODEL = "Qwen/Qwen2.5-72B-Instruct"
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"


async def _call_hf(system_prompt: str, user_prompt: str, max_tokens: int = 250) -> str:
    """Common helper to call the HuggingFace Inference Providers API (OpenAI-compatible)."""
    if not HF_API_TOKEN:
        raise ValueError("HF_API_TOKEN is not set. Please add your Hugging Face API token to .env")

    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": HF_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.7,
        "top_p": 0.9,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(HF_API_URL, json=payload, headers=headers)

            if response.status_code == 503:
                logger.info("HF model loading, retrying in 10s...")
                await asyncio.sleep(10)
                response = await client.post(HF_API_URL, json=payload, headers=headers)

            if response.status_code == 422 or response.status_code == 404:
                # Model not available, try fallback
                logger.warning(f"Primary model failed ({response.status_code}), trying fallback...")
                payload["model"] = "meta-llama/Llama-3.1-8B-Instruct"
                response = await client.post(HF_API_URL, json=payload, headers=headers)

            response.raise_for_status()
            result = response.json()

            # OpenAI chat completions format
            if "choices" in result and len(result["choices"]) > 0:
                text = result["choices"][0].get("message", {}).get("content", "").strip()
                return text
            else:
                raise ValueError(f"Unexpected HF response: {result}")

    except httpx.HTTPStatusError as e:
        logger.error(f"HF API error: {e.response.status_code} - {e.response.text}")
        raise ValueError(f"Hugging Face API error: {e.response.status_code}")
    except httpx.TimeoutException:
        raise ValueError("AI request timed out. The model may be loading — try again.")
    except Exception as e:
        logger.error(f"HF generation error: {str(e)}")
        raise ValueError(f"Generation failed: {str(e)}")


# ─── 1. Scholarship Description Generation ──────────────────────
async def generate_scholarship_description(title: str, category: str) -> str:
    system = "You are a professional scholarship program writer. Write clear, compelling descriptions."
    user = f"""Write a compelling, detailed scholarship description in 3-4 sentences.

Title: {title}
Category: {category}

Write a clear, professional description that explains the purpose, who it's for, and what it aims to achieve. Do NOT include the title in the response. Just the description paragraph."""

    return await _call_hf(system, user, max_tokens=200)


# ─── 2. Application Tips for Students ───────────────────────────
async def generate_application_tips(
    scholarship_title: str,
    scholarship_description: str,
    criteria: str,
    student_field: str,
    student_cgpa: str,
    student_location: str
) -> str:
    system = "You are a scholarship advisor helping students write winning applications."
    user = f"""A student wants to apply for a scholarship. Give them 4-5 specific, actionable tips to strengthen their application.

Scholarship: {scholarship_title}
Description: {scholarship_description}
Eligibility Criteria: {criteria}

Student Profile:
- Field of Study: {student_field or 'Not specified'}
- CGPA: {student_cgpa or 'Not specified'}
- Location: {student_location or 'Not specified'}

Give personalized tips as bullet points. Be specific about what to highlight and what gaps to address. Keep each tip to 1-2 sentences."""

    return await _call_hf(system, user, max_tokens=300)


# ─── 3. AI Review Summary for Providers ─────────────────────────
async def generate_review_summary(
    student_name: str,
    student_field: str,
    student_cgpa: str,
    student_location: str,
    scholarship_title: str,
    scholarship_criteria: str,
    mode: str = "review"
) -> str:
    system = "You are a scholarship review officer writing concise professional assessments."

    if mode == "rejection":
        user = f"""Write a brief, polite, and professional rejection reason for this application. Be empathetic but clear about why the student doesn't meet the criteria.

Student: {student_name}
Field: {student_field or 'Not specified'}
CGPA: {student_cgpa or 'Not specified'}
Location: {student_location or 'Not specified'}

Scholarship: {scholarship_title}
Criteria: {scholarship_criteria}

Write 2-3 sentences explaining the rejection reason professionally."""
    else:
        user = f"""Write a concise review summary for this application, covering strengths, concerns, and a recommendation.

Student: {student_name}
Field: {student_field or 'Not specified'}
CGPA: {student_cgpa or 'Not specified'}
Location: {student_location or 'Not specified'}

Scholarship: {scholarship_title}
Criteria: {scholarship_criteria}

Format as:
Strengths: (1-2 points)
Concerns: (1-2 points)
Recommendation: (Approve/Defer/Reject with brief reason)

Keep it concise and professional."""

    return await _call_hf(system, user, max_tokens=250)


# ─── 4. AI Profile Suggestions for Students ─────────────────────
async def generate_profile_suggestions(
    name: str,
    cgpa: str,
    field_of_study: str,
    income_level: str,
    location: str,
    gender: str,
    profile_strength: int
) -> str:
    filled = []
    missing = []
    for label, val in [("CGPA", cgpa), ("Field of Study", field_of_study), ("Income Level", income_level), ("Location", location), ("Gender", gender)]:
        if val:
            filled.append(f"{label}: {val}")
        else:
            missing.append(label)

    system = "You are a scholarship profile advisor helping students optimize their profiles."
    user = f"""A student has a profile that is {profile_strength}% complete. Give them 3-4 specific suggestions to improve their profile and increase their chances of getting matched with scholarships.

Student Name: {name}
Filled Fields: {', '.join(filled) if filled else 'None'}
Missing Fields: {', '.join(missing) if missing else 'All filled'}
Profile Strength: {profile_strength}%

Give short, actionable suggestions as bullet points. Focus on what's missing and how filling it helps. Each tip should be 1 sentence."""

    return await _call_hf(system, user, max_tokens=200)


# ─── 5. AI Eligibility Check for Students ───────────────────────
async def generate_eligibility_check(
    scholarship_title: str,
    scholarship_criteria: str,
    student_field: str,
    student_cgpa: str,
    student_location: str,
    student_income: str
) -> str:
    system = "You are a scholarship eligibility advisor giving clear, honest assessments."
    user = f"""Check if this student is eligible for the scholarship and give a clear verdict.

Scholarship: {scholarship_title}
Eligibility Criteria: {scholarship_criteria}

Student Profile:
- Field of Study: {student_field or 'Not specified'}
- CGPA: {student_cgpa or 'Not specified'}
- Location: {student_location or 'Not specified'}
- Income Level: {student_income or 'Not specified'}

Give a clear verdict in this format:
Verdict: (Likely Eligible / Partially Eligible / Likely Not Eligible)
Match: (percentage estimate like 75%)
Explanation: (2-3 sentences explaining why, what matches and what doesn't)"""

    return await _call_hf(system, user, max_tokens=200)
