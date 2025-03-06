export function formatResponse(response: string | null) {
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
  