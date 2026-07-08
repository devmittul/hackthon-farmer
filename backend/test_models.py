import google.generativeai as genai
import os

key = os.environ.get("GEMINI_API_KEY", "")
genai.configure(api_key=key.split(",")[0])

for m_name in ["models/gemini-2.5-flash", "models/gemini-3.5-flash", "models/gemini-flash-latest"]:
    try:
        model = genai.GenerativeModel(m_name)
        resp = model.generate_content("Hi")
        print(f"{m_name} success:", resp.text.strip())
        break
    except Exception as e:
        print(f"{m_name} error:", e)
