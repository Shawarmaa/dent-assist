'use client'

import { useState } from "react";
import { recordAndExport } from "@/lib/utils/audio";
import { transcribeAudio } from "@/lib/utils/stt";
import Teeth from "@/components/teeth";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [output, setOutput] = useState("");

  const handleRecord = async () => {
    setLoading(true);
    try {
      const blob = await recordAndExport();
      setAudioURL(URL.createObjectURL(blob));

      const text = await transcribeAudio(blob);
      setTranscript(text);
    } catch (err) {
      console.error("Recording error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!transcript) {
      alert("Please record audio first to generate a transcript");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();
      
      if (data.success) {
        setOutput(data.response);
      } else {
        setOutput(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("API error:", err);
      setOutput("Failed to analyze transcript. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (

    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>DentAssist AI</h1>
      <Teeth />

    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">DentAssist AI</h1>


      <div className="mb-6">
        <button 
          onClick={handleRecord} 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Recording..." : "Start Recording"}
        </button>
      </div>

      {audioURL && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">🔊 Your Audio</h2>
          <audio controls src={audioURL} className="w-full" />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">📝 Transcript</h2>
        <div className="p-4 bg-gray-100 rounded min-h-[100px]">
          {transcript || "No transcript available."}
        </div>
      </div>

      <div className="mb-6">
        <button 
          onClick={handleAnalyze} 
          disabled={analyzing || !transcript}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {analyzing ? "Analyzing..." : "Analyze Transcript"}
        </button>
      </div>

      {output && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">💡 AI Analysis</h2>
          <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      )}
    </main>
  );
}