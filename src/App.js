import { useState } from "react";

function Field({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 14, opacity: 0.9 }}>{label}</label>
      {children}
    </div>
  );
}

function Password({ value, onChange, id, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "10px 36px 10px 10px" }}
        required
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: "absolute",
          right: 6,
          top: "50%",
          transform: "translateY(-50%)",
          border: "1px solid #ddd",
          padding: "2px 6px",
          borderRadius: 6,
          background: "#f8f8f8",
          cursor: "pointer",
        }}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("login");

  // login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup state
  const [name, setName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPassword, setSPassword] = useState("");

  const [msg, setMsg] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setMsg(`(demo) Logged in as ${email}`);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setMsg(`(demo) Account created for ${sEmail}`);
    setTab("login");
    setEmail(sEmail);
    setPassword("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg,#f7f7f7,#eaeaea)",
        padding: 24,
      }}
    >
      <div style={{ width: 380, background: "#fff", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        <div style={{ padding: "20px 20px 0 20px", textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Farmified</h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.7 }}>Login or create your account</p>
        </div>

        <div style={{ padding: 20 }}>
          {/* Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              background: "#f2f2f2",
              borderRadius: 10,
              padding: 6,
              marginBottom: 10,
            }}
          >
            <button
              onClick={() => setTab("login")}
              style={{
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: tab === "login" ? "#fff" : "transparent",
                fontWeight: tab === "login" ? 600 : 400,
              }}
            >
              Login
            </button>
            <button
              onClick={() => setTab("signup")}
              style={{
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: tab === "signup" ? "#fff" : "transparent",
                fontWeight: tab === "signup" ? 600 : 400,
              }}
            >
              Sign Up
            </button>
          </div>

          {msg && (
            <div style={{ border: "1px solid #d9f0d9", background: "#eefaf0", padding: 10, borderRadius: 10, fontSize: 14, marginBottom: 10 }}>
              {msg}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
              <Field label="Email">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: 10 }}
                  required
                />
              </Field>

              <Field label="Password">
                <Password id="password" value={password} onChange={setPassword} placeholder="••••••••" />
              </Field>

              <button
                type="submit"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: "#2b7a2b",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: "grid", gap: 12 }}>
              <Field label="Full name">
                <input
                  type="text"
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: 10 }}
                  required
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={sEmail}
                  onChange={(e) => setSEmail(e.target.value)}
                  style={{ width: "100%", padding: 10 }}
                  required
                />
              </Field>

              <Field label="Password">
                <Password id="s-password" value={sPassword} onChange={setSPassword} placeholder="Create a strong password" />
              </Field>

              <button
                type="submit"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: "#2b7a2b",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Create account
              </button>
            </form>
          )}
        </div>

        <div style={{ padding: 14, fontSize: 12, textAlign: "center", color: "#666" }}>
          By continuing you agree to our Terms and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
