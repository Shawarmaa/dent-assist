'use client'

import { textToSpeech, getVoices } from "@/lib/utils/tts-client";
import { useState, useEffect, useCallback } from "react";
import { recordAndExport, stopRecording, isRecording } from "@/lib/utils/audio";
import { transcribeAudio } from "@/lib/utils/stt";
import Teeth from "@/components/teeth";

// log entries for patients
interface VisitEntry {
  tooth: number;
  procedure: string;
  surface: string | null;
}

interface Tooth {
  number: number;
  procedure: string;
  surface: string | null;
  status?: string; // Added to handle the old format
}

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [visitLog, setVisitLog] = useState<VisitEntry[]>([]);
  const [summaryDentist, setSummaryDentist] = useState("");
  const [summaryPatient, setSummaryPatient] = useState("");
  const [translatedPatientSummary, setTranslatedPatientSummary] = useState("");
  const [translating, setTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [patientAudioURL, setPatientAudioURL] = useState<string | null>(null);
  const [speechLoading, setSpeechLoading] = useState(false);

  // Available languages for translation
  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "nl", name: "Dutch" },
    { code: "de", name: "German" },
    { code: "hi", name: "Hindi" },
    { code: "ar", name: "Arabic" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" }
  ];

  // Load voices for a language
  const loadVoicesForLanguage = useCallback(async (locale: string) => {
    try {
      const availableVoices = await getVoices(locale || "en");
      
      if (availableVoices.length > 0) {
        
        // Choose the appropriate text based on whether it's translated or original
        const textToSpeak = locale !== "en" && translatedPatientSummary 
          ? translatedPatientSummary 
          : summaryPatient;
          
        if (textToSpeak) {
          setSpeechLoading(true);
          
          // Clean up previous audio URL if it exists
          if (patientAudioURL) {
            URL.revokeObjectURL(patientAudioURL);
            setPatientAudioURL(null);
          }
          
          // Generate speech with the first available voice
          const audioBlob = await textToSpeech(textToSpeak, {
            locale: locale || "en",
            voiceId: availableVoices[0].id,
            speed: 1.0
          });
          
          // Create a URL for the blob
          const url = URL.createObjectURL(audioBlob);
          setPatientAudioURL(url);
          setSpeechLoading(false);
        }
      }
    } catch (error) {
      console.error("Error with voices or speech generation:", error);
      setSpeechLoading(false);
    }
  }, [translatedPatientSummary, summaryPatient, patientAudioURL]);

  // Check recording status periodically
  useEffect(() => {
    const checkRecordingStatus = () => {
      setRecording(isRecording());
    };
    
    const interval = setInterval(checkRecordingStatus, 500);
    return () => clearInterval(interval);
  }, []);

  // Load voices when language changes
  useEffect(() => {
    if (selectedLanguage) {
      loadVoicesForLanguage(selectedLanguage);
    }
  }, [selectedLanguage, loadVoicesForLanguage]);

  // Add this effect to automatically generate speech for the original summary when it's first available
  useEffect(() => {
    if (summaryPatient && !patientAudioURL) {
      // Generate speech for original summary when it first appears
      loadVoicesForLanguage("en");
    }
  }, [summaryPatient, patientAudioURL, loadVoicesForLanguage]);

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (patientAudioURL) {
        URL.revokeObjectURL(patientAudioURL);
      }
    };
  }, [patientAudioURL]);
  
  const handleStartRecording = async () => {
    setLoading(true);
    setRecording(true);
    recordAndExport().then(blob => {
      setAudioURL(URL.createObjectURL(blob));
      transcribeAudio(blob).then(text => {
        setTranscript(text);
        setLoading(false);

        if (text) {
          handleAnalyse(text); // Clear previous output
        }
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

  const handleAnalyse = async (transcriptText = transcript) => {
    if (!transcriptText) {
      alert("Please record audio first to generate a transcript");
      return;
    }

    setAnalyzing(true);
    setVisitLog([]);
    setSummaryDentist("");
    setSummaryPatient("");
    
    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcriptText }),
      });

      const data = await response.json();
      console.log("LLM response:", data);
      
      
      if (data.success) {
        
        // Try to parse the response if it seems to be JSON
        if (data.response && typeof data.response === 'string' && data.response.trim().startsWith('{')) {
          try {
            const parsedData = JSON.parse(data.response);
            
            // Convert the "teeth" array to your VisitEntry format
            if (parsedData.teeth && Array.isArray(parsedData.teeth)) {
              const logEntries = parsedData.teeth.map((tooth: Tooth) => {
                let procedure = "n/a"; // Default fallback
                console.log("Tooth data:", tooth);
              
                // Try to extract from `tooth.procedure` if present
                if (tooth.procedure) {
                  procedure = tooth.procedure.toLowerCase();
                } else if (tooth.status) {
                  const status = tooth.status.toLowerCase();
                  if (status.includes("extract") || status === "extraction") {
                    procedure = "extraction";
                  } else if (status.includes("fill") || status === "filling") {
                    procedure = "filling";
                  } else {
                    procedure = "cavity";
                  }
                }
              
                return {
                  tooth: tooth.number,
                  procedure,
                  surface: tooth.surface || null,
                };
              });
              console.log("Parsed log entries:", logEntries);
              setVisitLog(logEntries);
            } else {
              // Fallback to the old format if available
              setVisitLog(parsedData.log || []);
            }
            
            setSummaryDentist(parsedData.summary_dentist || "");
            setSummaryPatient(parsedData.summary_patient || "");
          } catch (error) {
            console.error("Error parsing LLM response:", error);
            // We don't need to set output here as we've already set it above
          }
        }
      } else {
        console.log("LLM error:", data.error);
      }
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle language change and translation
  const handleTranslate = async (languageCode: string) => {
    if (!summaryPatient || !languageCode) {
      // Reset to original if no language/summary
      setTranslatedPatientSummary("");
      setSelectedLanguage(languageCode);
      
      // Clean up audio if exists
      if (patientAudioURL) {
        URL.revokeObjectURL(patientAudioURL);
        setPatientAudioURL(null);
      }
      return;
    }

    setTranslating(true);
    setSelectedLanguage(languageCode);
    
    try {
      // First get the translation
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: summaryPatient,
          targetLanguage: languageCode
        }),
      });

      // Get the translation directly as text
      const translatedText = await response.text();
      setTranslatedPatientSummary(translatedText);
      
      // Then automatically generate speech with the translated text
      await loadVoicesForLanguage(languageCode);
      
    } catch (err) {
      console.error("API error:", err);
      setTranslatedPatientSummary("");
    } finally {
      setTranslating(false);
    }
  };

  


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Dental Assistant AI</h1>
          <p className="text-gray-600">Record, analyze and document dental procedures with AI assistance</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Voice Recording
              </h2>
              {recording && (
                <span className="flex items-center text-red-500 text-sm">
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                  Recording
                </span>
              )}
            </div>
            
            {!recording ? (
              <button 
                onClick={handleStartRecording} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg shadow-md transition disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    Start Recording
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={handleStopRecording}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-lg shadow-md transition flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop Recording
              </button>
            )}
            
            {loading && !recording && (
              <div className="mt-4 flex items-center justify-center text-gray-600 bg-blue-50 p-3 rounded-lg">
                <svg className="animate-spin mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Transcribing audio...</span>
              </div>
            )}
            
            {audioURL && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                  </svg>
                  Recorded Audio
                </h3>
                <audio controls src={audioURL} className="w-full h-8" />
              </div>
            )}
          </div>
            
          <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
            <h2 className="text-lg font-semibold text-blue-800 flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Transcript
            </h2>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[120px] text-gray-700 font-light">
              {transcript ? transcript : (
                <div className="text-gray-400 italic text-center">
                  No transcript available. Start recording to generate a transcript.
                </div>
              )}
            </div>
          </div>
        </div>

        {analyzing && (
          <div className="mb-8 flex items-center justify-center p-4 bg-blue-50 rounded-lg text-blue-700 border border-blue-200">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing transcript with AI... This may take a moment.
          </div>
        )}
        
        <div className="mb-8">
          <Teeth visitLog={visitLog} />
        </div>

        {visitLog.length > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm8 8V7a1 1 0 00-1-1H6a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1z" clipRule="evenodd" />
                </svg>
                Dental Procedures
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tooth #</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedure</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surface</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visitLog.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 text-blue-800 font-semibold text-lg">
                          {entry.tooth}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          entry.procedure === "extraction" ? "bg-red-100 text-red-800" :
                          entry.procedure === "filling" ? "bg-green-100 text-green-800" :
                          entry.procedure === "cavity" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {entry.procedure}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {entry.surface ? (
                          <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100">
                            {entry.surface}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                        <button className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md transition-colors">
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
            <div className="grid grid-cols-3 border-t border-blue-100">
              <div className="p-5 text-center border-r border-blue-100">
                <div className="text-sm font-medium text-gray-500">Total Procedures</div>
                <div className="mt-1 text-3xl font-bold text-blue-700">{visitLog.length}</div>
              </div>
              <div className="p-5 text-center border-r border-blue-100">
                <div className="text-sm font-medium text-gray-500">Primary Procedures</div>
                <div className="mt-1 text-3xl font-bold text-blue-700">
                  {new Set(visitLog.map(entry => entry.procedure)).size}
                </div>
              </div>
              <div className="p-5 text-center">
                <div className="text-sm font-medium text-gray-500">Teeth Treated</div>
                <div className="mt-1 text-3xl font-bold text-blue-700">
                  {new Set(visitLog.map(entry => entry.tooth)).size}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {summaryDentist && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  For Dentist
                </h2>
              </div>
              <div className="p-6 bg-blue-50 text-blue-900">
                {summaryDentist}
              </div>
            </div>
          )}

          {summaryPatient && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  For Patient
                </h2>
                <div className="relative z-10">
                  <select
                    id="language-select"
                    className="text-sm bg-white border border-green-200 rounded px-3 py-1.5 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-green-300"
                    value={selectedLanguage}
                    onChange={(e) => handleTranslate(e.target.value)}
                    disabled={translating || speechLoading}
                  >
                    <option value="">Original</option>
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {(translating || speechLoading) && (
                    <div className="absolute -right-7 top-1.5">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 bg-green-50 text-green-900">
                {translatedPatientSummary || summaryPatient}
              </div>
              
              {/* Audio player */}
              {patientAudioURL && (
                <div className="px-6 py-4 bg-white border-t border-green-100">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Audio Summary</span>
                  </div>
                  <audio controls src={patientAudioURL} className="w-full h-10" />
                </div>
              )}
            </div>
          )}
        </div>

          
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2025 DentAssist AI | Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
}