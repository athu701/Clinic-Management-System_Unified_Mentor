import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { ref, get } from "firebase/database";

export default function ReceptionistLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    setErr(""); // reset error
    try {
      // Firebase Auth login
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Fetch user role from Realtime DB
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();

        if (userData.role === "receptionist") {
          // Save role in localStorage for ProtectedRoute
          localStorage.setItem("role", "receptionist");
          localStorage.setItem("uid", uid);

          // Redirect to dashboard
          navigate("/Receptionist-dashboard");
        } else {
          setErr("Not authorized as receptionist.");
          await auth.signOut(); // optional
        }
      } else {
        setErr("User record not found in database.");
      }
    } catch (e) {
      console.error("Login error:", e.code, e.message);
      setErr(e.message);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Receptionist Login</h2>

        <input
          className="auth-input"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={handleLogin}>Login</button>

        {err && <p style={{ color: "red", marginTop: "10px" }}>{err}</p>}
      </div>
    </div>
  );
}
