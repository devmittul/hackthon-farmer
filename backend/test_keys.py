import asyncio
import anthropic
import google.generativeai as genai
import os

test_key = os.environ.get("GEMINI_API_KEY", "")

async def test_anthropic():
    client = anthropic.AsyncAnthropic(api_key=test_key)
    try:
        await client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=10,
            messages=[{"role": "user", "content": "hi"}]
        )
        print("Anthropic: SUCCESS")
    except Exception as e:
        print(f"Anthropic: FAILED - {type(e).__name__}: {e}")

async def test_aerolink():
    client = anthropic.AsyncAnthropic(api_key=test_key, base_url="https://capi.aerolink.lat/")
    try:
        await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=10,
            messages=[{"role": "user", "content": "hi"}]
        )
        print("Aerolink: SUCCESS")
    except Exception as e:
        print(f"Aerolink: FAILED - {type(e).__name__}: {e}")

async def test_gemini():
    genai.configure(api_key=test_key)
    try:
        models = [m.name for m in genai.list_models()]
        print("Gemini Models:", models[:5])
        print("Gemini: SUCCESS")
    except Exception as e:
        print(f"Gemini: FAILED - {type(e).__name__}: {e}")

async def main():
    print("Testing keys...")
    await test_anthropic()
    await test_aerolink()
    await test_gemini()

if __name__ == "__main__":
    asyncio.run(main())
