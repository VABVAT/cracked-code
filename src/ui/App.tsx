import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState();
  useEffect(() => {
    //@ts-ignore
    window.electron.sendText((data) => setText(data.text));
  }, [])

  return (
    <>
      <div>Is this your system sound</div>
      {text} 
    </>
  )
}

export default App
