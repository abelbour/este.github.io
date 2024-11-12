import React, { useState, useEffect } from 'react';
import jsonata from 'jsonata';

const GoogleSheetDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const jsonataQuery = `$.values.{
    "Día": $[0],
    "Hora": $[1],
    "PuntoDeEncuentro": $[2],
    "Grupos": $split($[3], ", "),
    "Conductor": $[4],
    "Territorios": $eval('[' & $[5] & ']'),
    "Comentarios": $[6] != "" ? $[6] : undefined,
    "Publicar": ($[7] = "Publicar"),
    "DiaNum": $eval($[8])
  }[Publicar = true]`;

  useEffect(() => {
    const url = 'https://sheets.googleapis.com/v4/spreadsheets/1g6ZP3QrlF95YaaN21-wCeXY2h05D7VK7nYAXvOehdtA/values/salidas?alt=json&key=AIzaSyCz4sutc6Z6Hh5FtBTB53I8-ljkj6XWpPc';

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const jsonData = await response.json();

        console.log("Fetched JSON Data:", jsonData);  // Log raw data

        // Apply JSONata query
        const expression = jsonata(jsonataQuery);
        const result = expression.evaluate(jsonData);

        console.log("JSONata Processed Data:", result);  // Log processed data

        // Check if result is valid
        if (!result || result.length === 0) {
          console.log("No data matches the query.");
        }

        setData(result || []);  // Set the data or an empty array if no data
        setLoading(false);  // Set loading to false when data is ready
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once when the component mounts

  // Debugging: log the data before passing it to DataTable
  useEffect(() => {
    console.log("Data before passing to DataTable:", data);
  }, [data]);

  // If still loading, show a loading message
  if (loading) {
    return <p>Loading...</p>;
  }

  // If there was an error, show an error message
  if (error) {
    return <p>Error: {error}</p>;
  }

  // If no data is available
  if (data.length === 0) {
    return <p>No data to display</p>;
  }

  // Standard HTML table rendering
  const renderHtmlTable = () => {
    return (
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            {Object.keys(data[0]).map((key, index) => (
              <th key={index}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.keys(row).map((key, cellIndex) => (
                <td key={cellIndex}>{Array.isArray(row[key]) ? row[key].join(', ') : row[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <h1>Programa de predicación de casa en casa</h1>

      {/* Standard HTML Table */}
      <h2>Standard HTML Table</h2>
      {renderHtmlTable()}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <GoogleSheetDataTable />
    </div>
  );
}

export default App;
