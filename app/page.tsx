'use client'

import { useState } from "react";
import { recordAndExport } from "@/lib/utils/audio";
import { transcribeAudio } from "@/lib/utils/stt";

// log entries for patients
interface VisitEntry {
  tooth: number;
  procedure: string;
  surface: string | null;
}

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [visitLog, setVisitLog] = useState<VisitEntry[]>([]);
  const [summaryDentist, setSummaryDentist] = useState("");
  const [summaryPatient, setSummaryPatient] = useState("");
  const [rawResponse, setRawResponse] = useState("");

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
    setVisitLog([]);
    setSummaryDentist("");
    setSummaryPatient("");
    setOutput(null);
    setRawResponse("");
    
    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();
      
      // Store raw response for debugging
      setRawResponse(JSON.stringify(data, null, 2));
      
      if (data.success) {
        // Display the raw response text first
        setOutput(data.response);
        
        // Try to parse the response if it seems to be JSON
        if (data.response && typeof data.response === 'string' && data.response.trim().startsWith('{')) {
          try {
            const parsedData = JSON.parse(data.response);
            setVisitLog(parsedData.log || []);
            setSummaryDentist(parsedData.summary_dentist || "");
            setSummaryPatient(parsedData.summary_patient || "");
            
                    
          } catch (error) {
            console.error("Error parsing LLM response:", error);
            // We don't need to set output here as we've already set it above
          }
        }
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

      {rawResponse && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">🔍 Raw API Response (Debug)</h2>
          <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm">
            <pre className="whitespace-pre-wrap overflow-auto max-h-[300px]">{rawResponse}</pre>
          </div>
        </div>
      )}

      {visitLog.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">📋 Dental Procedures</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2">Tooth</th>
                  <th className="border-b px-4 py-2">Procedure</th>
                  <th className="border-b px-4 py-2">Surface</th>
                </tr>
              </thead>
              <tbody>
                {visitLog.map((entry, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="border-b px-4 py-2">{entry.tooth}</td>
                    <td className="border-b px-4 py-2">{entry.procedure}</td>
                    <td className="border-b px-4 py-2">{entry.surface || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {summaryDentist && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">👩‍⚕️ For Dentist</h2>
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            {summaryDentist}
          </div>
        </div>
      )}

      {summaryPatient && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">👤 For Patient</h2>
          <div className="p-4 bg-green-50 rounded border border-green-200">
            {summaryPatient}
          </div>
        </div>
      )}
    </main>
  );
}