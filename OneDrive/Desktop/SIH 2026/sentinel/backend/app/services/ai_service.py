import os
import json
import urllib.request
from app.models import Finding, AIAnalysisResult


def analyze_finding(finding: Finding) -> AIAnalysisResult:
    """
    Analyzes an existing deterministic security finding using AI (Gemini or OpenAI API).
    Falls back to a structured deterministic security analysis if no API key is provided
    or if the AI API is unreachable.
    """
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    # 1. Try Gemini API if key is available
    if gemini_key:
        try:
            return _call_gemini_api(finding, gemini_key)
        except Exception as e:
            print(f"[AI Service Warning] Gemini API call failed: {e}. Using fallback.")

    # 2. Try OpenAI API if key is available
    if openai_key:
        try:
            return _call_openai_api(finding, openai_key)
        except Exception as e:
            print(f"[AI Service Warning] OpenAI API call failed: {e}. Using fallback.")

    # 3. Fallback Deterministic Explanation Engine
    return _generate_fallback_analysis(finding)


def _call_gemini_api(finding: Finding, api_key: str) -> AIAnalysisResult:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = f"""
You are a cybersecurity expert auditing network infrastructure configurations.
Analyze the following security finding strictly:

- Vendor: {finding.vendor.value}
- Rule ID: {finding.rule_id}
- Finding Title: {finding.title}
- Severity: {finding.severity.value}
- Exact Evidence Line: "{finding.evidence}"
- Standard Remediation: "{finding.remediation}"

Return a valid JSON object with EXACTLY these three keys:
"why_it_matters": concise explanation of why this finding matters (1-2 sentences)
"potential_impact": potential real-world security impact (1-2 sentences)
"recommended_fix": step-by-step fix action (1-2 sentences)

Respond ONLY with valid JSON. No markdown formatting.
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        text_content = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
        
        # Clean possible markdown block delimiters
        if text_content.startswith("```json"):
            text_content = text_content[7:]
        if text_content.startswith("```"):
            text_content = text_content[3:]
        if text_content.endswith("```"):
            text_content = text_content[:-3]
            
        parsed = json.loads(text_content.strip())
        
        return AIAnalysisResult(
            finding_id=finding.id,
            why_it_matters=parsed.get("why_it_matters", f"{finding.title} introduces security risk on {finding.vendor.value}."),
            potential_impact=parsed.get("potential_impact", f"Attackers could exploit '{finding.evidence}'."),
            recommended_fix=parsed.get("recommended_fix", finding.remediation),
            ai_provider="Gemini 1.5 Flash API"
        )


def _call_openai_api(finding: Finding, api_key: str) -> AIAnalysisResult:
    url = "https://api.openai.com/v1/chat/completions"
    
    prompt = f"""
Analyze this security finding for a network audit:
- Vendor: {finding.vendor.value}
- Title: {finding.title}
- Severity: {finding.severity.value}
- Evidence: "{finding.evidence}"

Respond strictly in JSON format with keys: "why_it_matters", "potential_impact", "recommended_fix".
"""

    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "You are a cybersecurity expert auditing infrastructure configs. Respond in JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    )

    with urllib.request.urlopen(req, timeout=10) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        text_content = res_data["choices"][0]["message"]["content"].strip()
        parsed = json.loads(text_content)
        
        return AIAnalysisResult(
            finding_id=finding.id,
            why_it_matters=parsed.get("why_it_matters", f"{finding.title} introduces security risk."),
            potential_impact=parsed.get("potential_impact", f"Risk associated with evidence line: '{finding.evidence}'."),
            recommended_fix=parsed.get("recommended_fix", finding.remediation),
            ai_provider="OpenAI API (gpt-3.5-turbo)"
        )


def _generate_fallback_analysis(finding: Finding) -> AIAnalysisResult:
    return AIAnalysisResult(
        finding_id=finding.id,
        why_it_matters=f"The configuration line '{finding.evidence}' violates baseline security hardening standards for {finding.vendor.value.upper()} infrastructure.",
        potential_impact=f"If left unaddressed, this severity [{finding.severity.value}] vulnerability in '{finding.title}' could be leveraged by malicious actors to compromise device integrity.",
        recommended_fix=finding.remediation,
        ai_provider="Fallback Security Analysis Engine"
    )
