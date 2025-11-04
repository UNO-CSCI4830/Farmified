import React from "react";

function Home() {
  const widgets = [
    { title: "Database", info: "Entries: 124", btn: "View" },
    { title: "Messages", info: "Unread: 5", btn: "Check" }
  ];

  return (
    <div style={{ padding: "2rem", flexGrow: 1 }}>
      <h2 style={{ color: "#2e7d32" }}>Farmified</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
        marginTop: "2rem"
      }}>
        {widgets.map((w, i) => (
          <div key={i} style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "2rem",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
            transition: "transform 0.2s, box-shadow 0.2s"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
          }}>
            <h3 style={{ color: "#2e7d32", marginBottom: "1rem" }}>{w.title}</h3>
            <p style={{ color: "#555", marginBottom: "1.5rem" }}>{w.info}</p>
            <button style={{
              backgroundColor: "#2e7d32",
              color: "white",
              padding: "0.7rem 1.5rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
            onClick={() => alert(`${w.btn} clicked`)}>
              {w.btn}
            </button>
          </div>
        ))}
      </div>

      <footer style={{
        backgroundColor: "#f1f1f1",
        color: "#555",
        textAlign: "center",
        padding: "1rem",
        marginTop: "2rem"
      }}>
        <p>&copy; 2025 Farmified. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;