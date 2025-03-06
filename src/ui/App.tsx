import { useState } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState("");
  const [transcription, setTranscription] = useState<string | null>()
  async function startListening(){
    //@ts-ignore
    window.electron.startServer().then(
      (response:string) => setText(response)
    )
    //@ts-ignore
    window.electron.transcription((data) => setTranscription((prevText) => prevText + data.text + ''));
    // window.electron.sendText((data) => setText(data.text));
  }

  return (
    <>
      <button onClick={startListening}>Start server</button>
      {text == "" ? <div>Loading</div> : text} 
      {transcription ? transcription : <div>Wating for transcription</div>} 
    </>
  )
}

export default App
