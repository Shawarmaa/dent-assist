'use client'

import { useState } from "react";
import { recordAndExport } from "@/lib/utils/audio";
import { transcribeAudio } from "@/lib/utils/stt";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRecord = async () => {
    setLoading(true);
    try {
      const blob = await recordAndExport();
      setAudioURL(URL.createObjectURL(blob));

      const text = await transcribeAudio(blob);
      setTranscript(text);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>DentAssist AI</h1>

      <button onClick={handleRecord} disabled={loading}>
        {loading ? "Recording..." : "Start Recording"}
      </button>

      {audioURL && (
        <>
          <h2>🔊 Your Audio</h2>
          <audio controls src={audioURL} />
        </>
      )}

      <h2>📝 Transcript</h2>
      <p>{transcript || "No transcript available."}</p>
    
    </main>
  );
}