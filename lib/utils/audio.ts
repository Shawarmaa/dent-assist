export const recordAndExport = (): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                resolve(blob);
            };

            recorder.start();

            setTimeout(() => {
                recorder.stop();
            }, 5000); // stop recording after 5 seconds

        } catch (error) {
            console.error("Error accessing microphone:", error);   
            reject(error);
        }
    });
};  