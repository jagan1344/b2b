import streamlit as st
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load API Key
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Streamlit UI Setup
st.set_page_config(page_title='brevitybot')
st.title('🎬 YT TITLE AND DESCRIPTION GENERATOR')
st.write('Enter your video script or summary, our b2b will create a catchy title and optimized description.')

# Input
video_input = st.text_area('📕 VIDEO SCRIPT / SUMMARY', height=300)

# Generate Button
if st.button('GENERATE'):
    if not video_input.strip():
        st.warning('Please enter the video content.')
    else:
        with st.spinner("Generating using Gemini..."):
            prompt = f"""
            You are a professional YouTube content strategist.

            Given the following video content, generate:

            1. A catchy YouTube video title (under 100 characters)
            2. A short, SEO-optimized video description (2-3 lines)

            Video content:
            \"\"\"
            {video_input}
            \"\"\"
            """
            try:
                model = genai.GenerativeModel("models/gemini-1.5-flash")
                response = model.generate_content(prompt)
                st.success("✅ Generated Output")
                st.markdown(response.text)
            except Exception as e:
                st.error(f"❌ Gemini API Error: {e}")
