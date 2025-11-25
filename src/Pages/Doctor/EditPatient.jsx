import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase";
import { ref, onValue, set, remove } from "firebase/database";
import "../../styles/dashboard.css";

export default function EditPatient() {
  const { doctorId, patientId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [disease, setDisease] = useState("");
  const [assignedDoctorId, setAssignedDoctorId] = useState("");
  const [assignedDoctorName, setAssignedDoctorName] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!doctorId || !patientId) return;
    const patientRef = ref(db, `patients/${doctorId}/${patientId}`);
    onValue(patientRef, (snapshot) => {
      const p = snapshot.val();
      if (p) {
        setName(p.name || "");
        setAge(p.age || "");
        setDisease(p.disease || "");
        setAssignedDoctorId(p.assignedDoctor || doctorId);
        setAssignedDoctorName(p.assignedDoctorName || "");
        setSearchTerm(p.assignedDoctorName || "");
      }
    });
  }, [doctorId, patientId]);

  useEffect(() => {
    const doctorsRef = ref(db, "users/");
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .filter(([uid, value]) => value.role === "doctor")
        .map(([uid, value]) => ({ uid, name: value.name, email: value.email }));
      setDoctors(list);
    });
    return () => unsubscribe();
  }, []);

  const saveChanges = async () => {
    if (!assignedDoctorId) return alert("Please select a doctor");

    try {
      const oldPatientRef = ref(db, `patients/${doctorId}/${patientId}`);
      const oldSnapshot = await new Promise((resolve) =>
        onValue(oldPatientRef, resolve, { onlyOnce: true })
      );
      const oldPatient = oldSnapshot.val() || {};

      if (assignedDoctorId !== doctorId) {
        await remove(oldPatientRef);
        await set(ref(db, `patients/${assignedDoctorId}/${patientId}`), {
          name,
          age,
          disease,
          assignedDoctor: assignedDoctorId,
          assignedDoctorName: assignedDoctorName,
          token: -1,
          status: oldPatient.status || "waiting",
          tokenTime: Date.now(),
          assignedReceptionist:
            oldPatient.assignedReceptionist || localStorage.getItem("uid"), // ✅ add this
        });
      } else {
        await set(oldPatientRef, {
          name,
          age,
          disease,
          assignedDoctor: assignedDoctorId,
          assignedDoctorName: assignedDoctorName,
          token: oldPatient.token || -1,
          status: oldPatient.status || "waiting",
          tokenTime: Date.now(),
          assignedReceptionist:
            oldPatient.assignedReceptionist || localStorage.getItem("uid"),
        });
      }

      alert("Patient updated successfully!");
      navigate("/Receptionist-dashboard");
    } catch (err) {
      console.error("Error updating patient:", err);
      alert("Failed to update patient. Try again.");
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDoctorSelect = (doc) => {
    setAssignedDoctorId(doc.uid);
    setAssignedDoctorName(doc.name);
    setSearchTerm(doc.name);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Edit Patient</h1>

      <div className="form-box">
        <label className="form-label">Name</label>
        <input
          className="form-input"
          value={name}
          placeholder={name || "Patient Name"}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="form-label">Age</label>
        <input
          className="form-input"
          value={age}
          placeholder={age || "Age"}
          type="number"
          onChange={(e) => setAge(e.target.value)}
        />

        <label className="form-label">Disease</label>
        <input
          className="form-input"
          value={disease}
          placeholder={disease || "Disease"}
          onChange={(e) => setDisease(e.target.value)}
        />

        <label className="form-label">Assign Doctor</label>
        <input
          type="text"
          placeholder="Search doctor by name or UID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
        />

        <div className="max-h-40 overflow-y-auto border border-blue-300 rounded mt-2">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.uid}
              className={`p-2 cursor-pointer hover:bg-blue-100 ${
                assignedDoctorId === doc.uid ? "bg-blue-200 font-semibold" : ""
              }`}
              onClick={() => handleDoctorSelect(doc)}
            >
              {doc.name} ({doc.uid})
            </div>
          ))}
        </div>

        <button className="btn-primary mt-4" onClick={saveChanges}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
