# 🦷 DentAssist

**DentAssist** is a voice-powered dental assistant that listens to dentists in real time and transforms speech into structured, actionable clinical insight. Built during a hackathon, DentAssist was awarded:

- 🥇 **1st Place** – Neuphonic AI Challenge  
- 🥈 **2nd Overall**  
- 🥈 **2nd Place** – Google Developer Group Challenge  

---

## ✨ Key Features

- 🎤 **Live Voice Streaming**: Captures and streams audio during dental procedures  
- ✍️ **Real-time Transcription**: Converts speech to text using **AssemblyAI**  
- 🧠 **LLM Analysis**: Uses **Google Gemini 2.5 Pro (Preview)** to interpret and summarise transcripts  
- 🦷 **3D Dental Visualisation**: Maps dental regions and planned treatments onto a dynamic **Three.js** model  
- 🧾 **Dual Summaries**: Generates technical summaries for clinicians and simplified explanations for patients  
- 🌍 **Multilingual Translation**: Breaks language barriers to support international patients  
- 🔊 **Voice Playback**: Plays back summaries using **Neuphonic**’s realistic voice synthesis  

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router) + Tailwind CSS  
- **3D Visualisation**: Three.js with mapped dental chart  
- **Speech-to-Text**: AssemblyAI  
- **LLM Processing**: Google Gemini 2.5 Pro (Preview)  
- **Text-to-Speech**: Neuphonic Voice AI  

---

## 🧠 How It Works

1. **Audio Capture**: Live audio is streamed from dental appointments  
2. **Transcription**: AssemblyAI handles real-time speech-to-text conversion  
3. **LLM Processing**: Gemini extracts structured insight and summaries  
4. **Visualisation**: Annotated teeth are rendered in 3D with colour-coded plans  
5. **Summary Generation**: Both technical and simplified summaries are created  
6. **Voice Playback & Translation**: Summaries are played aloud and translated if needed  

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or later  
- API keys for:
  - Google Gemini  
  - AssemblyAI  
  - Neuphonic  

### Installation

