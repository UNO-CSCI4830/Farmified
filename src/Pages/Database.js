import React, { useEffect, useState } from "react";
import "../styles/database.css";

function Database() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/data/midwest_crop_animal_prices.csv")
      .then((response) => response.text())
      .then((csvText) => {
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

  // Filter data based on search input
  const filteredData = data.filter((row) =>
    row[headers[0]]
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="database-container">
      <h1>Database</h1>
      <p>Price Database</p>

      {/* Search input */}
      <input
        type="text"
        placeholder={`Search ${headers[0]}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "8px", marginBottom: "12px", width: "250px" }}
      />

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
            {filteredData.map((row, idx) => (
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
