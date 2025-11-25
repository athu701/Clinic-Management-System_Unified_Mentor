import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, onValue } from "firebase/database";

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [users, setUsers] = useState([]);

  // Fetch users
  useEffect(() => {
    const usersRef = ref(db, "users/");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const userList = Object.entries(data).map(([id, info]) => ({
        id,
        ...info,
      }));
      setUsers(userList);
    });
  }, []);

  // Create Account
  const createAccount = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await set(ref(db, "users/" + uid), {
        name,
        email,
        role,
      });

      alert(`${role} account created successfully`);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Admin Dashboard</h1>

      <div style={styles.card}>
        <h2>Create User</h2>

        <input
          style={styles.input}
          value={name}
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={styles.input}
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="doctor">Doctor</option>
          <option value="receptionist">Receptionist</option>
        </select>

        <button style={styles.button} onClick={createAccount}>Create User</button>
      </div>

      <div style={styles.listCard}>
        <h2>All Users</h2>

        {users.map((u) => (
          <div key={u.id} style={styles.userItem}>
            <strong>{u.name}</strong> ({u.role})
          </div>
        ))}
      </div>
    </div>
  );
}

// UI Styles
const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
    background: "#f0f7ff",
    minHeight: "100vh",
  },
  heading: {
    color: "#0b66c3",
    marginBottom: "30px",
  },
  card: {
    margin: "0 auto",
    width: "400px",
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 0 18px rgba(0,0,0,0.1)",
  },
  listCard: {
    marginTop: "40px",
    marginLeft: "auto",
    marginRight: "auto",
    width: "500px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 0 12px rgba(0,0,0,0.1)",
  },
  input: {
    display: "block",
    width: "95%",
    padding: "10px",
    margin: "10px auto",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#0b66c3",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  userItem: {
    padding: "12px",
    background: "#e9f3ff",
    borderRadius: "8px",
    margin: "10px 0",
  },
};
