import axios from 'axios';

const ASSEMBLYAI_API_KEY = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || '';

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {

    // uploads audio
    const buffer = await audioBlob.arrayBuffer();
    const uploadRes = await axios.post(
        "https://api.assemblyai.com/v2/upload",
        buffer,
        {
          headers: {
            authorization: ASSEMBLYAI_API_KEY,
            "Content-Type": "application/octet-stream",
          },
        }
      );
    
    const audioURL = uploadRes.data.upload_url;

    // Transcribe the audio

    const transcriptRes = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        {
          audio_url: audioURL,
        },
        {
          headers: {
            authorization: ASSEMBLYAI_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
    
    const transcriptId = transcriptRes.data.id;

    // Poll for the transcription result

    while (true) {
        const polling = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            headers: {
              authorization: ASSEMBLYAI_API_KEY,
            },
          }
        );
    
        if (polling.data.status === "completed") {
          return polling.data.text;
        } else if (polling.data.status === "error") {
          throw new Error(polling.data.error);
        }
    
        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2s
      }
    };
