import React, { useState, useEffect } from 'react';
import jsonata from 'jsonata';
import { useQuery } from '@tanstack/react-query'
import useCasaEnCasaApi from '../hooks/useCasaEnCasaApi';


const GoogleSheetDataTable = () => {
  const {fetchData} = useCasaEnCasaApi();
  const query = useQuery({queryKey: ['casaEnCasa'], queryFn:fetchData});

  // If still loading, show a loading message
  if (query.isLoading) {
    return <p>Loading...</p>;
  }

  // If there was an error, show an error message
  if (query.isError) {
    return <p>Error: {query.error.message}</p>;
  }

  // If no data is available
  if (query.data.length === 0) {
    return <p>No data to display</p>;
  }

  // Standard HTML table rendering
  const renderHtmlTable = () => {
    return (
      <table border={1} cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            {Object.keys(query.data[0]).map((key, index) => (
              <th key={index}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {query.data.map((row, rowIndex) => (
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
