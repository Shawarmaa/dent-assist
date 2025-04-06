'use client'

import { useState, useEffect } from "react";
import { getVoices, textToSpeech } from "@/lib/utils/tts-client";

export default function TtsTest() {
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [message, setMessage] = useState<string>("Hello, this is a test of the Neuphonic text-to-speech API.");
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [locale, setLocale] = useState<string>("en");
  const [error, setError] = useState<string | null>(null);

  // Load voices on component mount
  useEffect(() => {
    loadVoices();
  }, [locale]);

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const loadVoices = async () => {
    setError(null);
    try {
      const availableVoices = await getVoices(locale);
      setVoices(availableVoices);
      
      // Set the first voice as default if available
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].id);
      }
    } catch (error) {
      console.error("Error loading voices:", error);
      setError("Failed to load voices. Please try again.");
    }
  };

  const handleGenerateSpeech = async () => {
    if (!message) return;
    
    setLoading(true);
    setError(null);
    
    // Clean up previous audio URL if it exists
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
    
    try {
      // Get the audio blob from our client utility
      const audioBlob = await textToSpeech(message, {
        locale,
        voiceId: selectedVoice,
        speed: 1.0
      });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);

    } catch (error) {

      console.error("Error generating speech:", error);
      setError("Failed to generate speech. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Neuphonic TTS Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <label className="block mb-2 font-medium">Language</label>
        <select 
          className="w-full p-2 border rounded"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
        >
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
          <option value="nl">Dutch</option>
          <option value="de">German</option>
          <option value="hi">Hindi</option>
          <option value="ar">Arabic</option>
          <option value="zh">Chinese</option>
          <option value="ja">Japanese</option>
          <option value="pt">Portugese</option>
          <option value="ru">Russian</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 font-medium">Voice</label>
        <select 
          className="w-full p-2 border rounded"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          disabled={voices.length === 0}
        >
          {voices.length === 0 && (
            <option value="">Loading voices...</option>
          )}
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name} ({voice.gender})
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 font-medium">Message</label>
        <textarea
          className="w-full p-2 border rounded h-32"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded mb-6 hover:bg-blue-600 disabled:bg-gray-400"
        onClick={handleGenerateSpeech}
        disabled={loading || !selectedVoice}
      >
        {loading ? "Generating..." : "Generate Speech"}
      </button>
      
      {audioURL && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Generated Audio</h2>
          <audio controls src={audioURL} className="w-full" />
        </div>
      )}
      
      <div className="mt-8">
        <a href="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </a>
      </div>
    </main>
  );
}
