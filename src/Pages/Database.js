import React, { useEffect, useState } from "react";
import "../styles/database.css";

function Database() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Mapping button labels to CSV Category values
  const categoryMap = {
    All: "All",
    Vegetable: "Veggie", // display "Vegetable", filter "Veggie"
    Grain: "Grain",
    Fruit: "Fruit",
    "Animal Product": "Animal Product",
    "Animal Byproduct": "Animal Byproduct",
    Other: "Other",
  };

  useEffect(() => {
    fetch("/data/midwest_crop_animal_prices.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const lines = csvText.trim().split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());
        const data = lines.slice(1).map((line) => {
          const values = line.split(",");
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = (values[index] || "").trim(); // trim spaces
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

  const filteredData = data.filter((row) => {
    const matchesSearch = row[headers[0]]
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const csvCategory = categoryMap[categoryFilter] || categoryFilter;

    const matchesCategory =
      categoryFilter === "All" ||
      (row.Category || "").toLowerCase() === csvCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="database-container">
      <h1>Database</h1>
      <p>Price Database</p>

      {/* Search bar */}
      <input
        type="text"
        placeholder={`Search ${headers[0]}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "8px", marginBottom: "12px", width: "250px" }}
      />

      {/* Category Filter Buttons */}
      <div style={{ marginBottom: "15px" }}>
        {Object.keys(categoryMap).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              marginRight: "8px",
              padding: "6px 12px",
              backgroundColor: categoryFilter === cat ? "#4CAF50" : "#ddd",
              border: "1px solid #999",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

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
