import { useEffect, useState } from "react";

export default function CropTable() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState(""); // <-- NEW

  useEffect(() => {
    fetch("/midwest_crop_animal_prices.json")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  // NEW: Filtered data based on search
  const filteredData = data.filter((row) =>
    row.Crop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="table-container">
      <h1>Midwest Crop & Animal Product Prices</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search crops..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "8px", marginBottom: "12px", width: "250px" }}
      />

      <table>
        <thead>
          <tr>
            <th>Crop</th>
            <th>Unit</th>
            <th>Approx price</th>
            <th>Retail price</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, i) => (
            <tr key={i}>
              <td>{row.Crop}</td>
              <td>{row.Unit}</td>
              <td>{row["Approx price"]}</td>
              <td>{row["Retail price"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
