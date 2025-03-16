import { useEffect, useState, useRef } from "react";
import "./App.css";
import Formate from "./formatting/Formate.tsx"
import './index.css';
// import { useNavigate } from "react-router-dom";
// import {useHotkeys} from 'react-hotkeys-hook'
let respIndex = 0;
function App() {
  //@ts-ignore
  const [text, setText] = useState("");
  const [transcription, setTranscription] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const responseContainerRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true)
  const transRef = useRef<string|null>('');
  useEffect(() => {
    transRef.current = transcription
  }, [transcription])
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
        responseContainerRef.current.scrollBy({ top: 320, behavior: "smooth" });
      }
    });
    //@ts-ignore
    window.electron.onScrollUp(() => {
      if (responseContainerRef.current) {
        responseContainerRef.current.scrollBy({ top: -320, behavior: "smooth" });
      }
    });
    //@ts-ignore
    window.electron.rr(() => {
      reset()
      setText("server is still running")
    })
    //@ts-ignore
    window.electron.gpt((data:any)=> {
      setResponse(data)
      storeResponse(data)
    })
    //@ts-ignore
    window.electron.sendSS(() => sendAdvanced());
    //@ts-ignore
    window.electron.vc(() => startListening())
    //@ts-ignore
    window.electron.sai(() =>sendToAi())
    //@ts-ignore
    window.electron.scai(() => sendToAiC())
    //@ts-ignore
    window.electron.sendSSClaude(() => sendAdvancedC())
  }, [])

  async function startListening() {
    //@ts-ignore
    window.electron.startServer().then((response: string) => setText(response));
    //@ts-ignore
    window.electron.transcription((data) =>
      setTranscription((prevText) => (prevText ? prevText + " " + data.text : data.text))
    );
  }

function storeResponse(data:string){
  if(localStorage.getItem('response')){
    const curr = JSON.parse(localStorage.getItem('response') || '[]')
    if(curr.length >= 5) curr.shift();
    curr.push(data)
    localStorage.setItem('response', JSON.stringify(curr))
  }else{
    const arr = []
    arr.push(data)
    localStorage.setItem('response', JSON.stringify(arr))
  }
}

async function sendAdvanced() { 
    setResponse(null);
    let fullResponse = ""; // Store response in a variable

    //@ts-ignore
    window.electron.streamDeepSeekResponse(
        transcription, 
        (chunk:any) => {
            console.log("reached");
            fullResponse += chunk; // Append chunk to full response
            setResponse((prev) => prev ? prev + chunk : chunk);
        },
        () => {
            const storedResponses = JSON.parse(localStorage.getItem('response') || '[]');

            if (storedResponses.length >= 5) storedResponses.shift(); // Maintain only 5 responses
            storedResponses.push(fullResponse); // Use fullResponse instead of state
            
            localStorage.setItem('response', JSON.stringify(storedResponses));
            respIndex = storedResponses.length - 1; // Update index
        },
        (errorMessage:any) => {
            console.error("Streaming error:", errorMessage);
            setResponse("Error fetching response");
        }
    );
}

  async function sendAdvancedC() {
    setResponse(null)
    console.log(transRef.current);
    
    //@ts-ignore
      window.electron.sendImageWithPromptC(transRef.current).then((resp:string) => {
        setResponse(resp)
        storeResponse(resp)
      })
      
  }

  async function sendToAi() {
    setResponse(null)
    //@ts-ignore
    window.electron.airesponse(transRef.current).then((resp: string) => {
      setResponse(resp);
      storeResponse(resp)
    });
    
  }
  async function sendToAiC() {
    setResponse(null)
    //@ts-ignore
    window.electron.ClaudeResponse(transRef.current).then((resp: string) => {
      setResponse(resp);
      storeResponse(resp)
    });
    
  }
  function reset(){
    transRef.current = '';
    setTranscription("")
    
  }
  return (
<div className="flex p-4 min-w-screen h-screen ">
  <div className="p-4 h-full w-[40%]  flex flex-col">
    <div className={`p-8 font-semibold ${darkMode ? "text-white": "text-black"} w-full h-[45%] overflow-auto bg-opacity-40 ${darkMode ? "bg-black": "bg-white"} m-4`}>
      <div>
      <div className="text-small font-bold">
        <div>ctrl + shift + Z: send images with no prompt deepseek reasoner</div>
        <div>ctrl + shift + F: images with prompt claude answers with intution</div>
        <div>ctrl + shift + A: only prompt using claude</div>
        <div>ctrl + shift + V: send images to gpt-4o</div>
        <div>ctrl + shift + D: reset images</div>
        <div>ctrl + shift + I: only prompt to deepseek reasoner</div>
        <div>ctrl + shift + C: previous answer</div>
        <div>ctrl + shift + X: click screenshot</div>
        <div>ctrl + shift + Q: minimize</div>
        <div>ctrl + shift + R: reset transcription</div>
        
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
           {<Formate text={response} />}
          </div>
        ) : null}
      </div>
</div>

  );
}

export default App;