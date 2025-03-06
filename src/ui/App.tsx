import { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [transcription, setTranscription] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  async function startListening() {
    //@ts-ignore
    window.electron.startServer().then((response: string) => setText(response));
    //@ts-ignore
    window.electron.transcription((data) =>
      setTranscription((prevText) => (prevText ? prevText + " " + data.text : data.text))
    );
  }

  async function sendToAi() {
    //@ts-ignore
    window.electron.airesponse(transcription).then((resp: string) => setResponse(resp));
  }

  function formatResponse(response: string | null) {
    if (!response) return <p className="text-gray-500">Not received</p>;
  
    // Check if response contains a table (basic detection for Markdown tables)
    if (response.includes("|") && response.includes("---")) {
      const rows = response.trim().split("\n").map((row) => row.split("|").map((cell) => cell.trim()));
  
      return (
        <table className="border-collapse border border-gray-400 w-full mt-2">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border border-gray-400">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-gray-400 p-2 text-gray-800">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  
    // Check if response contains code
    if (response.includes("\n") || response.includes("{") || response.includes(";")) {
      return (
        <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
          <code>{response}</code>
        </pre>
      );
    }
  
    // Default case: Render plain text
    return <p className="text-gray-700">{response}</p>;
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">AI Assistant</h1>
      
      <div className="flex gap-4">
        <button onClick={startListening} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Start Server
        </button>
        <button onClick={() => setText("")} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500">
          Reset
        </button>
        <button onClick={sendToAi} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
          Send to AI
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
          Restart Server
        </button>
      </div>

      <div className="mt-6 p-4 w-full max-w-2xl bg-white shadow-md rounded-lg">
        <h2 className="text-lg font-semibold">Server Response:</h2>
        {text === "" ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <p className="text-gray-800">{text}</p>
        )}
      </div>

      <div className="mt-4 p-4 w-full max-w-2xl bg-white shadow-md rounded-lg">
        <h2 className="text-lg font-semibold">Transcription:</h2>
        {transcription ? (
          <p className="text-gray-800">{transcription}</p>
        ) : (
          <p className="text-gray-500">Waiting for transcription...</p>
        )}
      </div>

      <div className="mt-4 p-4 w-full max-w-2xl bg-white shadow-md rounded-lg">
        <h2 className="text-lg font-semibold">AI Response:</h2>
        {formatResponse(response)}
      </div>
    </div>
  );
}

export default App;
