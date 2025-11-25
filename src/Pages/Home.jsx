import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const uid = localStorage.getItem("uid");
    const role = localStorage.getItem("role");

    if (uid && role) {
      // Redirect based on role
      if (role === "doctor") navigate("/doctor-dashboard");
      else if (role === "receptionist") navigate("/receptionist-dashboard");
      else if (role === "admin") navigate("/admin-dashboard");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("role");
    window.location.reload(); // reload to show login portal
  };

  const uid = localStorage.getItem("uid");
  const role = localStorage.getItem("role");

  if (uid && role) {
    // Logged in view with logout button
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px 60px",
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            textAlign: "center",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <h1 style={{ marginBottom: "10px", color: "#1a237e" }}>
            Welcome!
          </h1>
          <p style={{ color: "#555", marginBottom: "30px" }}>
            Logged in as <b>{role}</b>
          </p>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              background: "#e53935",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.background = "#c62828")}
            onMouseOut={(e) => (e.target.style.background = "#e53935")}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Not logged in view with login portals
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px 60px",
          borderRadius: "18px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h1 style={{ marginBottom: "10px", color: "#1a237e" }}>
          Clinic Management App
        </h1>
        <p style={{ color: "#555", marginBottom: "30px" }}>
          Select your login portal
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <Link to="/doctor-login" style={{ textDecoration: "none" }}>
            <button
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                background: "#1e88e5",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "0.3s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#1565c0")}
              onMouseOut={(e) => (e.target.style.background = "#1e88e5")}
            >
              Doctor Login
            </button>
          </Link>

          <Link to="/receptionist-login" style={{ textDecoration: "none" }}>
            <button
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                background: "#43a047",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "0.3s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#2e7d32")}
              onMouseOut={(e) => (e.target.style.background = "#43a047")}
            >
              Receptionist Login
            </button>
          </Link>

          <Link to="/admin-login" style={{ textDecoration: "none" }}>
            <button
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                background: "#212121",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "0.3s",
                marginTop: "10px",
              }}
              onMouseOver={(e) => (e.target.style.background = "#000")}
              onMouseOut={(e) => (e.target.style.background = "#212121")}
            >
              Admin Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
