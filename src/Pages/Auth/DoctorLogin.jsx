import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { ref, get } from "firebase/database";

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    setErr(""); 
    try {
      
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

     
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();

        if (userData.role === "doctor") {
          
          localStorage.setItem("role", "doctor");
          localStorage.setItem("uid", uid);

         
          navigate("/doctor-dashboard");
        } else {
          setErr("Not authorized as doctor.");
          await auth.signOut(); 
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
        <h2 className="auth-title">Doctor Login</h2>

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






