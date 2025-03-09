import { useEffect, useState, useRef } from "react";
import "./App.css";
import Formate from "./formatting/Formate.tsx"
import './index.css';
// import { useNavigate } from "react-router-dom";
// import {useHotkeys} from 'react-hotkeys-hook'
let respIndex = 0;
function App() {
  const [text, setText] = useState("");
  const [transcription, setTranscription] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const responseContainerRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true)
  useEffect(() => {
    // window.electron.scroll()
    //@ts-ignore
    window.electron.mode(() => setDarkMode((prev) => !prev))
    //@ts-ignore
    window.electron.cycleResponse(() => {
      const responses = JSON.parse(localStorage.getItem('response') || '[]')
      if(responses.length > 1){
        respIndex = (respIndex == 0) ? responses.length-1 : respIndex-1;
        setResponse(""); // Force a re-render
        setTimeout(() => setResponse(responses[respIndex]), 10); // Set actual response after a tiny delay
      }
      // console.log(response)
      // alert(responses)
    })
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
    setResponse(null)
    //@ts-ignore
      window.electron.sendImageWithPrompt(transcription).then((resp:string) => {
        setResponse(resp)
        if(localStorage.getItem('response')){
          const curr = JSON.parse(localStorage.getItem('response') || '[]')
          if(curr.length >= 3) curr.shift();
          curr.push(resp)
          localStorage.setItem('response', JSON.stringify(curr))
          respIndex = curr.length-1
        }else{
          const arr = []
          arr.push(resp)
          localStorage.setItem('response', JSON.stringify(arr))
          respIndex = 0
        }
      })
      
  }

  async function sendToAi() {
    setResponse(null)
    //@ts-ignore
    window.electron.airesponse(transcription).then((resp: string) => {
      setResponse(resp);
      if(localStorage.getItem('response')){
        const curr = JSON.parse(localStorage.getItem('response') || '[]')
        if(curr.length >= 3) curr.shift();
        curr.push(resp)
        localStorage.setItem('response', JSON.stringify(curr))
      }else{
        const arr = []
        arr.push(resp)
        localStorage.setItem('response', JSON.stringify(arr))
      }
    });
    
  }
  
  function reset(){
    setTranscription("")
    
  }
  return (
<div className="flex p-4 min-w-screen h-screen ">
  <div className="p-4 h-full w-[40%]  flex flex-col">
    <div className={`p-8 font-semibold ${darkMode ? "text-white": "text-black"} w-full h-[45%] overflow-auto bg-opacity-40 ${darkMode ? "bg-black": "bg-white"} m-4`}>
      <div>
      <div>
        {text == "" ? <span>ctrl + shift + S: to start the transcription</span>: text}
      </div>
      <div>
        {/* Shortcuts:
        <div>ctrl + shift + Z</div>
        <div>ctrl + shift + I : send transcription</div>
        <div>ctrl + shift + R : reset the transcription</div>
        <div>ctrl + down : scroll down</div>
        <div>ctrl + up : scroll up</div>
        <div>ctrl + shift + Q : maximize/minimiZe</div> */}
        {/* <div>ctrl + shift + M : minize</div> */}
      </div>
    </div>
    </div>
    <div className={`font-semibold ${darkMode ? "text-white" : "text-black "} p-4 w-full h-[55%] overflow-auto bg-opacity-40 ${darkMode ? "bg-black" : "bg-white"} m-4`}>
      Transcription: {transcription}
    </div>
  </div>
  <div ref={responseContainerRef} className={`font-semibold h-full ${darkMode ? "text-white" : "text-black"} w-[60%] overflow-y-auto bg-opacity-40  m-4 ${darkMode ? "bg-black" : "bg-white"}`}>
        {response ? (
          <div className="w-full h-full p-4">
            <Formate text={response} speed={3} />
          </div>
        ) : null}
      </div>
</div>

  );
}

export default App;