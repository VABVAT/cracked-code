import { useEffect, useState, useRef } from "react";
import "./App.css";
import Formate from "./formatting/Formate.tsx"
import './index.css';
// import { useNavigate } from "react-router-dom";
// import {useHotkeys} from 'react-hotkeys-hook'

function App() {
  const [text, setText] = useState("");
  const [transcription, setTranscription] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const responseContainerRef = useRef<HTMLDivElement>(null);
  // const navigate = useNavigate()
// In your React component
  // text -> server-response, transcription -> transcrption, repsonse -> reposnse 
  useEffect(() => {
    // window.electron.scroll()
    //@ts-ignore    
    window.electron.onScrollDown(() => {
      if (responseContainerRef.current) {
        responseContainerRef.current.scrollBy({ top: 100, behavior: "smooth" });
      }
    });
    //@ts-ignore
    window.electron.onScrollUp(() => {
      if (responseContainerRef.current) {
        responseContainerRef.current.scrollBy({ top: -100, behavior: "smooth" });
      }
    });
    //@ts-ignore
    window.electron.rr(() => {
      reset()
      setText("server is still running")
    })
    //@ts-ignore
    window.electron.sendSS(() => sendAdvanced());
    //@ts-ignore
    window.electron.vc(() => startListening())
    //@ts-ignore
    window.electron.sai(() =>sendToAi())
  }, [])

  async function startListening() {
    //@ts-ignore
    window.electron.startServer().then((response: string) => setText(response));
    //@ts-ignore
    window.electron.transcription((data) =>
      setTranscription((prevText) => (prevText ? prevText + " " + data.text : data.text))
    );
  }

  async function sendAdvanced() {
    //@ts-ignore
      window.electron.sendImageWithPrompt(transcription).then((resp:string) => setResponse(resp))
      setResponse(null)
  }

  async function sendToAi() {
    //@ts-ignore
    window.electron.airesponse(transcription).then((resp: string) => setResponse(resp));
    setResponse(null)
  }
  
  function reset(){
    setTranscription("")
    
  }
  return (
<div className="flex p-8 min-w-screen h-screen ">
  <div className="p-4 h-full w-[40%]  flex flex-col">
    <div className="p-4 text-white w-full h-[20%] overflow-auto bg-opacity-10 bg-black m-4">
      {text}
    </div>
    <div className="text-white p-4 w-full h-[80%] overflow-auto bg-opacity-10 bg-black m-4 ">
      {transcription}
    </div>
  </div>
  <div ref={responseContainerRef} className="h-full w-[60%] overflow-y-auto bg-opacity-10 bg-black m-4">
        {response ? (
          <div className="w-full h-full p-4">
            <Formate text={response} speed={40} />
          </div>
        ) : null}
      </div>
</div>

  );
}

export default App;
