import { useEffect, useState } from "react";
import "../../styles/dashboard.css";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  async function loadPatients() {
    const snapshot = await getDocs(collection(db, "patients"));
    let data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    setPatients(data);
  }

  async function deletePatient(id) {
    await deleteDoc(doc(db, "patients", id));
    loadPatients(); // Refresh UI
  }

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">Patients</h1>

      <div className="card">
        <table className="patient-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Disease</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.age}</td>
                <td>{p.disease}</td>
                <td>
                  <button className="action-btn edit-btn" onClick={() => navigate(`/doctor/edit-patient/${p.id}`)}>
                    Edit
                  </button>

                  <button
                    className="action-btn delete-btn"
                    style={{ marginLeft: "6px" }}
                    onClick={() => deletePatient(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
