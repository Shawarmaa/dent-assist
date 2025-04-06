let activeRecorder: MediaRecorder | null = null;
let activeStream: MediaStream | null = null;

export const stopRecording = (): void => {
    if (activeRecorder && activeRecorder.state === "recording") {
      activeRecorder.stop();
    }
    
    // Also stop and release the media stream
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      activeStream = null;
    }
  };

export const recordAndExport = (): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
        try {
            stopRecording();

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            activeStream = stream;

            const recorder = new MediaRecorder(stream);
            activeRecorder = recorder; 
            
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                resolve(blob);

                activeRecorder = null; // Clear the active recorder reference
            };

            recorder.start();

            setTimeout(() => {
                if (recorder.state === "recording") {
                    console.log("Safety timeout: stopping recording after 60 seconds");
                    recorder.stop();
                  }
            }, 60000); // stop recording after 60 seconds

        } catch (error) {
            console.error("Error accessing microphone:", error);   
            reject(error);
        }
    });
};  

export const isRecording = (): boolean => {
    return activeRecorder !== null && activeRecorder.state === "recording";
  };