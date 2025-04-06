'use client'

import { useState, useEffect } from "react";
import { recordAndExport, stopRecording, isRecording } from "@/lib/utils/audio";
import { transcribeAudio } from "@/lib/utils/stt";
import Teeth from "@/components/teeth";

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
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [visitLog, setVisitLog] = useState<VisitEntry[]>([]);
  const [summaryDentist, setSummaryDentist] = useState("");
  const [summaryPatient, setSummaryPatient] = useState("");
  const [rawResponse, setRawResponse] = useState("");

  // Check recording status periodically
  useEffect(() => {
    const checkRecordingStatus = () => {
      setRecording(isRecording());
    };
    
    const interval = setInterval(checkRecordingStatus, 500);
    return () => clearInterval(interval);
  }, []);

  const handleStartRecording = async () => {
    setLoading(true);
    setRecording(true);
    recordAndExport().then(blob => {
      setAudioURL(URL.createObjectURL(blob));
      transcribeAudio(blob).then(text => {
        setTranscript(text);
        setLoading(false);
      }).catch(err => {
        console.error("Transcription error:", err);
        setLoading(false);
      });
    }).catch(err => {
      console.error("Recording error:", err);
      setLoading(false);
      setRecording(false);
    });
  };

  const handleStopRecording = () => {
    stopRecording();
    setRecording(false);
    // Don't set loading to false yet as we're still processing
  };

  const handleAnalyse = async () => {
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
      setOutput("Failed to analyse transcript. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };
  
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">DentAssist AI</h1>
      <Teeth />

      <div className="mb-6">
        {!recording ? (
          <button 
            onClick={handleStartRecording} 
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Start Recording"}
          </button>
        ) : (
          <button 
            onClick={handleStopRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Stop Recording
          </button>
        )}
        
        {loading && !recording && (
          <span className="ml-3 text-gray-600">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Transcribing audio...
          </span>
        )}
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
          onClick={handleAnalyse} 
          disabled={analyzing || !transcript}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {analyzing ? "Analyzing..." : "Analyse Transcript"}
        </button>
      </div>

      {visitLog.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">📋 Dental Procedures</h2>
          <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tooth #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedure</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surface</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visitLog.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-medium">
                        {entry.tooth}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.procedure === "extraction" ? "bg-red-100 text-red-800" :
                        entry.procedure === "filling" ? "bg-green-100 text-green-800" :
                        entry.procedure === "cavity" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {entry.procedure}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {entry.surface ? (
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100">
                          {entry.surface}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-500">Total Procedures</div>
              <div className="mt-1 text-2xl font-semibold">{visitLog.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-500">Primary Procedures</div>
              <div className="mt-1 text-2xl font-semibold">
                {new Set(visitLog.map(entry => entry.procedure)).size}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-500">Teeth Treated</div>
              <div className="mt-1 text-2xl font-semibold">
                {new Set(visitLog.map(entry => entry.tooth)).size}
              </div>
            </div>
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