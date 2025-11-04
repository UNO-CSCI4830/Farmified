import React, { useEffect, useState } from "react";
import "../styles/database.css";

function Database() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    fetch("/data/midwest_crop_animal_prices.csv") // path inside public folder
      .then((response) => response.text())
      .then((csvText) => {
        // Manual CSV parsing
        const lines = csvText.trim().split("\n");
        const headers = lines[0].split(",");
        const data = lines.slice(1).map((line) => {
          const values = line.split(",");
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          return obj;
        });
        setData(data);
        setHeaders(headers);
      })
      .catch((error) => {
        console.error("Error loading CSV data:", error);
      });
  }, []);

  return (
    <div className="database-container">
      <h1>Database</h1>
      <p>Price Database</p>
      {data.length > 0 ? (
        <table className="database-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {headers.map((header) => (
                  <td key={header}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default Database;