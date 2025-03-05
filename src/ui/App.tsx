import { useState } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState("");

  async function startListening(){
    //@ts-ignore
    window.electron.startServer().then(
      (response:string) => setText(response)
    )
    
    // window.electron.sendText((data) => setText(data.text));
  }

  return (
    <>
      <button onClick={startListening}>Start server</button>
      {text == "" ? <div>Loading</div> : text} 
    </>
  )
}

export default App
