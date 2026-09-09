"""
MedEase AI — AI Explanation & Translation Layer
Implements strict LLM system prompts, golden examples, and an offline deterministic Demo/Mock provider.

STRICT COMPLIANCE RULES:
1. The rule engine status is authoritative.
2. Never diagnose or predict diseases.
3. Never recommend treatments.
4. Explain neutrally in simple language.
"""

import json
import os
import httpx
from typing import Dict, Any, Optional
from app.config import settings
from app.schemas.report import TestStatus, ExplanationItem

SYSTEM_PROMPT = """You are a medical report explanation assistant.
Your task is to explain information already present in a medical report in simple,
understandable language.

STRICT RULES:
1. Never diagnose or predict a disease.
2. Never prescribe medication or recommend treatment, starting, or stopping medication.
3. Never claim the user is healthy or unhealthy.
4. Never invent medical information or a reference range — use only what is supplied.
5. The reference range and status provided by the backend are authoritative and final;
   do not contradict or re-derive them.
6. Explain results neutrally, without alarming language.
7. If status is OUTSIDE_PROVIDED_RANGE, say the value is outside the range the report
   provided — do not name or imply a condition.
8. If status is UNABLE_TO_DETERMINE, say the report doesn't provide enough reference
   information to classify this value — do not guess.
9. Encourage discussion with a qualified healthcare professional when appropriate.
10. Do not provide emergency medical instructions unless the user explicitly asks about
    an emergency; this is an educational report-understanding tool.

Return only structured JSON in the exact schema provided. No prose outside the JSON."""

# Comprehensive Canned Demo Knowledge Base (English & Tamil + Multilingual Fallback)
CANONICAL_TEST_EXPLANATIONS: Dict[str, Dict[str, Any]] = {
    "hemoglobin": {
        "measure_en": "Hemoglobin is an iron-rich protein in red blood cells that carries oxygen from your lungs to the rest of your body.",
        "measure_ta": "ஹீமோகுளோபின் என்பது உங்கள் நுரையீரலில் இருந்து உடலின் மற்ற பகுதிகளுக்கு ஆக்ஸிஜனைக் கொண்டு செல்லும் இரத்த சிவப்பணுக்களில் உள்ள புரதமாகும்.",
        "measure_hi": "हीमोग्लोबिन लाल रक्त कोशिकाओं में मौजूद प्रोटीन है जो शरीर में ऑक्सीजन पहुंचाता है।",
        "measure_te": "హిమోగ్లోబిన్ అనేది ఎర్ర రక్త కణాలలో ఉండే ప్రోటీన్, ఇది శరీరమంతటా ఆక్సిజన్‌ను మోసుకెళ్తుంది.",
        "measure_ml": "ശരീരത്തിൽ ഓക്സിജൻ എത്തിക്കുന്ന ചുവന്ന രക്താണുക്കളിലെ പ്രോട്ടീനാണ് ഹീമോഗ്ലോബിൻ.",
        "measure_kn": "ಹಿಮೋಗ್ಲೋಬಿನ್ ಕೆಂಪು ರಕ್ತ ಕಣಗಳಲ್ಲಿರುವ ಪ್ರೋಟೀನ್ ಆಗಿದ್ದು ದೇಹದಾದ್ಯಂತ ಆಮ್ಲಜನಕವನ್ನು ಒಯ್ಯುತ್ತದೆ."
    },
    "wbc": {
        "measure_en": "White Blood Cells (WBC) are cells of the immune system that help your body fight off infections.",
        "measure_ta": "வெள்ளை இரத்த அணுக்கள் (WBC) உங்கள் உடலை தொற்றுகளிலிருந்து பாதுகாக்க உதவும் நோய் எதிர்ப்பு சக்தி செல்களாகும்.",
        "measure_hi": "श्वेत रक्त कोशिकाएं (WBC) संक्रमण से लड़ने में मदद करने वाली प्रतिरक्षा कोशिकाएं हैं।",
        "measure_te": "తెల్ల రక్త కణాలు (WBC) ఇన్ఫెక్షన్లతో పోరాడటానికి శరీరానికి సహాయపడే రోగనిరోధక కణాలు.",
        "measure_ml": "അണുബാധകളെ ചെറുക്കാൻ സഹായിക്കുന്ന പ്രതിരോധ കോശങ്ങളാണ് വെളുത്ത രക്താണുക്കൾ.",
        "measure_kn": "ಬಿಳಿ ರಕ್ತ ಕಣಗಳು ಸೋಂಕುಗಳ ವಿರುದ್ಧ ಹೋರಾಡಲು ಸಹಾಯ ಮಾಡುವ ರೋಗನಿರೋಧಕ ಕೋಶಗಳಾಗಿವೆ."
    },
    "platelets": {
        "measure_en": "Platelets are tiny blood cell fragments that help your blood clot to stop or prevent bleeding.",
        "measure_ta": "பிளேட்லெட்டுகள் என்பவை இரத்தக்கசிவை நிறுத்த அல்லது தடுக்க இரத்தம் உறைவதற்கு உதவும் சிறிய இரத்த அணு துண்டுகள் ஆகும்.",
        "measure_hi": "प्लेटलेट्स रक्त के थक्के जमने और रक्तस्राव रोकने में मदद करने वाले छोटे कण हैं।",
        "measure_te": "ప్లేట్‌లెట్స్ రక్తస్రావాన్ని ఆపడానికి రక్తం గడ్డకట్టడానికి సహాయపడే కణాలు.",
        "measure_ml": "രക്തസ്രാവം തടയാൻ രക്തം കട്ടപിടിക്കാൻ സഹായിക്കുന്ന കോശങ്ങളാണ് പ്ലേറ്റ്‌ലെറ്റുകൾ.",
        "measure_kn": "ಪ್ಲೇಟ್‌ಲೆಟ್‌ಗಳು ರಕ್ತಸ್ರಾವವನ್ನು ತಡೆಗಟ್ಟಲು ರಕ್ತ ಹೆಪ್ಪುಗಟ್ಟಲು ಸಹಾಯ ಮಾಡುವ ಕಣಗಳಾಗಿವೆ."
    },
    "example test a": {
        "measure_en": "Example Test A measures a standard laboratory parameter indicative of biochemical activity.",
        "measure_ta": "மாதிரி சோதனை A என்பது உயிர்வேதியியல் செயல்பாட்டைக் குறிக்கும் ஒரு நிலையான ஆய்வக அளவுருவை அளவிடுகிறது.",
        "measure_hi": "उदाहरण परीक्षण A जैव रासायनिक गतिविधि का एक सामान्य प्रयोगशाला परीक्षण है।",
        "measure_te": "ఉదాహరణ పరీక్ష A అనేది జీవరసాయన కార్యకలాపాన్ని కొలిచే ప్రామాణిక ప్రయోగశాల పరీక్ష.",
        "measure_ml": "ഉദാഹരണ പരിശോധന A ഒരു സാധാരണ ലബോറട്ടറി അളവുകോലാണ്.",
        "measure_kn": "ಉದಾಹರಣೆ ಪರೀಕ್ಷೆ A ಜೈವಿಕ ರಾಸಾಯನಿಕ ಚಟುವಟಿಕೆಯ ಪ್ರಮಾಣಿತ ಪ್ರಯೋಗಾಲಯ ಪರೀಕ್ಷೆಯಾಗಿದೆ."
    },
    "example test b": {
        "measure_en": "Example Test B evaluates a general biological marker evaluated in standard diagnostic profiles.",
        "measure_ta": "மாதிரி சோதனை B என்பது வழக்கமான ஆய்வக சுயவிவரங்களில் மதிப்பிடப்படும் ஒரு பொதுவான உயிரியல் குறியீட்டை மதிப்பிடுகிறது.",
        "measure_hi": "उदाहरण परीक्षण B एक सामान्य जैविक मार्कर का परीक्षण करता है।",
        "measure_te": "ఉదాహరణ పరీక్ష B ప్రామాణిక ప్రయోగశాల ప్రొఫైల్‌లలో సాధారణ బయోమార్కర్‌ను అంచనా వేస్తుంది.",
        "measure_ml": "ഉദാഹരണ പരിശോധന B സാധാരണ ലബോറട്ടറി പരിശോധനയിലെ ഒരു മാർക്കറാണ്.",
        "measure_kn": "ಉದಾಹರಣೆ ಪರೀಕ್ಷೆ B ಒಂದು ಸಾಮಾನ್ಯ ಜೈವಿಕ ಗುರುತನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತದೆ."
    },
    "example test c": {
        "measure_en": "Example Test C evaluates a specialized biomarker requiring specific lab reference context.",
        "measure_ta": "மாதிரி சோதனை C என்பது ஆய்வகத்தின் குறிப்பிட்ட குறிப்பு சூழல் தேவைப்படும் ஒரு சிறப்பு பயோमार्க்கரை மதிப்பிடுகிறது.",
        "measure_hi": "उदाहरण परीक्षण C एक विशेष बायोमार्कर का मूल्यांकन करता है।",
        "measure_te": "ఉదాహరణ పరీక్ష C ప్రయోగశాల సూచన సందర్భం అవసరమయ్యే ప్రత్యేక బయోమార్కర్‌ను అంచనా వేస్తుంది.",
        "measure_ml": "ഉദാഹരണ പരിശോധന C പ്രത്യേക ലബോറട്ടറി റഫറൻസ് ആവശ്യമുള്ള ഒരു ബയോമാർക്കറാണ്.",
        "measure_kn": "ಉದಾಹರಣೆ ಪರೀಕ್ಷೆ C ಪ್ರಯೋಗಾಲಯದ ಉಲ್ಲೇಖ ಅಗತ್ಯವಿರುವ ಒಂದು ಜೈವಿಕ ಗುರುತಾಗಿದೆ."
    }
}


def get_mock_explanation(
    test_name: str,
    value: Any,
    unit: str,
    status: TestStatus,
    reference_text: str,
    language: str = "en"
) -> ExplanationItem:
    """
    Deterministic mock explanation generator complying 100% with the strict safety rules.
    Used in demo mode and as offline fallback.
    """
    name_clean = test_name.lower().strip()
    canned = CANONICAL_TEST_EXPLANATIONS.get(name_clean)
    
    # Measure explanation
    lang_key = f"measure_{language}" if language in ["ta", "hi", "te", "ml", "kn"] else "measure_en"
    if canned and lang_key in canned:
        test_exp = canned[lang_key]
    elif canned and "measure_en" in canned:
        test_exp = canned["measure_en"]
    else:
        if language == "ta":
            test_exp = f"{test_name} என்பது உங்கள் மருத்துவ அறிக்கையில் உள்ள ஒரு குறிப்பிட்ட ஆய்வக அளவுருவை அளவிடுகிறது."
        else:
            test_exp = f"{test_name} measures a specific physiological or biochemical parameter in your laboratory sample."

    # Meaning & Attention per Status
    if status == TestStatus.WITHIN_PROVIDED_RANGE:
        if language == "ta":
            simple_meaning = "இந்த சோதனை முடிவு ஆய்வக அறிக்கையில் வழங்கப்பட்ட குறிப்பு வரம்பிற்குள் உள்ளது."
            attention_reason = ""
            prof_disc = ""
        elif language == "hi":
            simple_meaning = "यह परिणाम रिपोर्ट में दी गई संदर्भ सीमा के भीतर है।"
            attention_reason = ""
            prof_disc = ""
        elif language == "te":
            simple_meaning = "ఈ ఫలితం నివేదికలో అందించిన సూచన పరిధిలో ఉంది."
            attention_reason = ""
            prof_disc = ""
        elif language == "ml":
            simple_meaning = "ഈ ഫലം റിപ്പോർട്ടിൽ നൽകിയിട്ടുള്ള റഫറൻസ് പരിധിക്കുള്ളിലാണ്."
            attention_reason = ""
            prof_disc = ""
        elif language == "kn":
            simple_meaning = "ಈ ಫಲಿತಾಂಶವು ವರದಿಯಲ್ಲಿ ಒದಗಿಸಲಾದ ಉಲ್ಲೇಖ ಶ್ರೇಣಿಯಲ್ಲಿದೆ."
            attention_reason = ""
            prof_disc = ""
        else:
            simple_meaning = "This reported value falls within the reference range provided in the report."
            attention_reason = ""
            prof_disc = ""

    elif status == TestStatus.OUTSIDE_PROVIDED_RANGE:
        if language == "ta":
            simple_meaning = "அறிக்கையிடப்பட்ட மதிப்பு ஆய்வக அறிக்கையில் கொடுக்கப்பட்ட குறிப்பு வரம்பிற்கு வெளியே உள்ளது."
            attention_reason = "அறிக்கையிடப்பட்ட மதிப்பு ஆய்வக அறிக்கையில் வழங்கப்பட்ட குறிப்பு வரம்பிற்கு வெளியே உள்ளதால் இது முன்னிலைப்படுத்தப்பட்டுள்ளது."
            prof_disc = "உங்களுக்கு ஏதேனும் அறிகுறிகள் அல்லது சந்தேகங்கள் இருந்தால், தகுதியான மருத்துவ நிபுணருடன் இந்த முடிவைப் பற்றி கலந்துரையாடுங்கள்."
        elif language == "hi":
            simple_meaning = "यह परिणाम प्रयोगशाला रिपोर्ट में दी गई संदर्भ सीमा से बाहर है।"
            attention_reason = "यह मान रिपोर्ट की सामान्य सीमा से बाहर होने के कारण हाइलाइट किया गया है।"
            prof_disc = "इस परिणाम के संदर्भ में योग्य स्वास्थ्य पेशेवर से परामर्श करें।"
        elif language == "te":
            simple_meaning = "ఈ ఫలితం ప్రయోగశాల నివేదికలో అందించిన సూచన పరిధికి వెలుపల ఉంది."
            attention_reason = "ఈ విలువ సూచన పరిధికి వెలుపల ఉన్నందున హైలైట్ చేయబడింది."
            prof_disc = "ఈ ఫలితం గురించి అర్హత కలిగిన వైద్య నిపుణులతో చర్చించండి."
        elif language == "ml":
            simple_meaning = "ഈ ഫലം ലബോറട്ടറി റിപ്പോർട്ടിൽ നൽകിയിട്ടുള്ള റഫറൻസ് പരിധിക്ക് പുറത്താണ്."
            attention_reason = "ഈ മൂല്യം റഫറൻസ് പരിധിക്ക് പുറത്തായതിനാൽ ഹൈലൈറ്റ് ചെയ്തിരിക്കുന്നു."
            prof_disc = "ഈ ഫലത്തെക്കുറിച്ച് ഒരു ആരോഗ്യ വിദഗ്ദ്ധനുമായി ചർച്ച ചെയ്യുക."
        elif language == "kn":
            simple_meaning = "ಈ ಫಲಿತಾಂಶವು ಪ್ರಯೋಗಾಲಯ ವರದಿಯಲ್ಲಿ ಒದಗಿಸಲಾದ ಉಲ್ಲೇಖ ಶ್ರೇಣಿಯ ಹೊರಗಿದೆ."
            attention_reason = "ಈ ಮೌಲ್ಯವು ಉಲ್ಲೇಖ ಶ್ರೇಣಿಯ ಹೊರಗಿರುವುದರಿಂದ ಹೈಲೈಟ್ ಮಾಡಲಾಗಿದೆ."
            prof_disc = "ಈ ಫಲಿತಾಂಶದ ಬಗ್ಗೆ ಅರ್ಹ ವೈದ್ಯಕೀಯ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಚರ್ಚಿಸಿ."
        else:
            simple_meaning = "The reported value is outside the reference range provided in the report."
            attention_reason = "The reported value is highlighted because it is outside the reference range provided in the laboratory report."
            prof_disc = "Consider discussing this result with a qualified healthcare professional, especially if you have symptoms or concerns."

    else:  # UNABLE_TO_DETERMINE
        if language == "ta":
            simple_meaning = "இந்த மதிப்பை வகைப்படுத்த MedEase AI க்கு ஆய்வக அறிக்கை போதுமான குறிப்பு தகவல்களை வழங்கவில்லை."
            attention_reason = "ஆய்வக அறிக்கையில் குறிப்பிட்ட குறிப்பு வரம்பு அச்சிடப்படவில்லை அல்லது போதுமானதாக இல்லை."
            prof_disc = "இந்த முடிவின் குறிப்பிட்ட சூழலை அறிய உங்கள் மருத்துவரிடம் ஆலோசிக்கவும்."
        elif language == "hi":
            simple_meaning = "इस मान को वर्गीकृत करने के लिए रिपोर्ट में पर्याप्त संदर्भ जानकारी उपलब्ध नहीं है।"
            attention_reason = "रिपोर्ट में संदर्भ सीमा का अभाव है।"
            prof_disc = "कृपया इस परिणाम की व्याख्या के लिए डॉक्टर से बात करें।"
        elif language == "te":
            simple_meaning = "ఈ విలువను వర్గీకరించడానికి నివేదిక తగినంత సూచన సమాచారాన్ని అందించలేదు."
            attention_reason = "నివేదికలో సూచన పరిధి అందుబాటులో లేదు."
            prof_disc = "దయచేసి ఈ ఫలితం గురించి మీ వైద్యుడితో మాట్లాడండి."
        elif language == "ml":
            simple_meaning = "ഈ മൂല്യം തരംതിരിക്കാൻ റിപ്പോർട്ടിൽ ആവശ്യമായ വിവരങ്ങൾ ലഭ്യമല്ല."
            attention_reason = "റഫറൻസ് പരിധി ലഭ്യമല്ല."
            prof_disc = "ഈ ഫലത്തെക്കുറിച്ച് ഡോക്ടറോട് സംസാരിക്കുക."
        elif language == "kn":
            simple_meaning = "ಈ ಮೌಲ್ಯವನ್ನು ವರ್ಗೀಕರಿಸಲು ವರದಿಯು ಸಾಕಷ್ಟು ಉಲ್ಲೇಖ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಿಲ್ಲ."
            attention_reason = "ಉಲ್ಲೇಖ ಶ್ರೇಣಿ ಲಭ್ಯವಿಲ್ಲ."
            prof_disc = "ದಯವಿಟ್ಟು ಈ ಫಲಿತಾಂಶದ ಬಗ್ಗೆ ವೈದ್ಯರೊಂದಿಗೆ ಮಾತನಾಡಿ."
        else:
            simple_meaning = "The report does not provide enough reference information for MedEase AI to classify this value."
            attention_reason = "No printed reference range was detected or available for this parameter in the report."
            prof_disc = "Discuss this result with your healthcare professional to understand its clinical context."

    return ExplanationItem(
        test_explanation=test_exp,
        simple_meaning=simple_meaning,
        attention_reason=attention_reason,
        professional_discussion=prof_disc
    )


async def generate_explanation(
    test_name: str,
    value: Any,
    unit: str,
    reference_text: str,
    status: TestStatus,
    language: str = "en"
) -> ExplanationItem:
    """
    Generates explanation adhering strictly to the contract.
    If DEMO_MODE is true or AI API key is not configured, returns deterministic mock explanation.
    Otherwise, invokes the configured LLM with the mandated system prompt.
    """
    if settings.DEMO_MODE or not settings.AI_API_KEY:
        return get_mock_explanation(test_name, value, unit, status, reference_text, language)

    # Online LLM invocation (e.g. Gemini or OpenAI)
    try:
        user_prompt = f"""Test: {test_name}
Value: {value} {unit}
Reference: {reference_text}
Rule Engine Status: {status.value.upper()}
Target Language: {language}

Provide JSON explanation matching the required schema."""

        # Call Gemini or OpenAI based on config
        if settings.AI_PROVIDER == "gemini":
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.AI_API_KEY}"
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": f"{SYSTEM_PROMPT}\n\n{user_prompt}"}]}
                ],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.1
                }
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_json = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(raw_json)
                    return ExplanationItem(
                        test_explanation=parsed.get("test_explanation", ""),
                        simple_meaning=parsed.get("simple_meaning", ""),
                        attention_reason=parsed.get("attention_reason", ""),
                        professional_discussion=parsed.get("professional_discussion", "")
                    )
        elif settings.AI_PROVIDER == "openai":
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {settings.AI_API_KEY}", "Content-Type": "application/json"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.1
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    parsed = json.loads(data["choices"][0]["message"]["content"])
                    return ExplanationItem(
                        test_explanation=parsed.get("test_explanation", ""),
                        simple_meaning=parsed.get("simple_meaning", ""),
                        attention_reason=parsed.get("attention_reason", ""),
                        professional_discussion=parsed.get("professional_discussion", "")
                    )
    except Exception as e:
        print(f"[AI Service Warning] LLM call failed, falling back to deterministic explanation: {e}")

    # Fallback to deterministic explanation
    return get_mock_explanation(test_name, value, unit, status, reference_text, language)


def get_patient_summary_text(
    total: int,
    within: int,
    outside: int,
    unable: int,
    language: str = "en"
) -> str:
    """
    Returns the canonical patient-friendly summary paragraph (Section 7a).
    """
    if language == "ta":
        return (
            f"உங்கள் அறிக்கையில் {total} சோதனை முடிவுகள் உள்ளன. {within} முடிவுகள் வழங்கப்பட்ட குறிப்பு வரம்புகளுக்குள் உள்ளன. "
            f"{outside} முடிவுகள் வழங்கப்பட்ட குறிப்பு வரம்புகளுக்கு வெளியே உள்ளன. போதுமான குறிப்புத் தகவல் கிடைக்காததால் {unable} முடிவுகளை வகைப்படுத்த முடியவில்லை. "
            f"முக்கியமானது: குறிப்பு வரம்பிற்கு வெளியே உள்ள முடிவு மட்டுமே ஒரு நோயறிதலை நிறுவாது. தகுதியான மருத்துவ நிபுணருடன் உங்கள் அறிக்கையைப் பற்றி விவாதிக்கவும்."
        )
    elif language == "hi":
        return (
            f"आपकी रिपोर्ट में {total} परीक्षण परिणाम हैं। {within} परिणाम दी गई संदर्भ सीमा के भीतर हैं। "
            f"{outside} परिणाम दी गई संदर्भ सीमा से बाहर हैं। {unable} परिणामों को पर्याप्त संदर्भ जानकारी के अभाव में वर्गीकृत नहीं किया जा सका। "
            f"महत्वपूर्ण: सामान्य सीमा से बाहर का परिणाम स्वतः कोई बीमारी स्थापित नहीं करता। कृपया डॉक्टर से परामर्श लें।"
        )
    else:
        return (
            f"Your report contains {total} test results. {within} results are within the provided reference ranges. "
            f"{outside} results are outside the provided reference ranges. {unable} results could not be classified "
            f"because sufficient reference information was unavailable. Important: a result outside a reference range "
            f"does not by itself establish a diagnosis. Discuss your report with a qualified healthcare professional."
        )
