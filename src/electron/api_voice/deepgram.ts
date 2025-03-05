import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import fetch from "cross-fetch";
import dotenv from "dotenv";
dotenv.config()
// Your local audio stream
const url = "http://localhost:3001/audio"; 

export const live = async () => {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
  const connection = deepgram.listen.live({
    model: "nova-3",
    language: "en-US",
    smart_format: true,
  });

  connection.on(LiveTranscriptionEvents.Open, () => {
    console.log("Connected to Deepgram!");

    fetch(url)
      .then((r:any) => r.body)
      .then((res:any) => {
        res.on("readable", () => {
          connection.send(res.read());
        });
      })
      .catch(console.error);
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data:any) => {
    console.log("📝 Transcription:", data.channel.alternatives[0].transcript);
  });

  connection.on(LiveTranscriptionEvents.Error, (err:any) => {
    console.error("⚠️ Deepgram Error:", err);
  });
};


