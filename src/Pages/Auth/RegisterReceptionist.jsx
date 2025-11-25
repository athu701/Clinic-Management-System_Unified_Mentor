import { useState } from "react";
import "../../styles/auth.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterReceptionist() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState("");

  async function register() {
    const user = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", user.user.uid), {
      name,
      email,
      role: "receptionist",
    });

    setSuccess("Receptionist registered successfully!");
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Register Receptionist</h2>

        <input className="auth-input" placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input className="auth-input" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input className="auth-input" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        <button className="auth-btn" onClick={register}>Register</button>
        {success && <p style={{ color: "green" }}>{success}</p>}
      </div>
    </div>
  );
}
