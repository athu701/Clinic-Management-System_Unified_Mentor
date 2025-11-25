import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue, remove, set } from "firebase/database";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function AssignedPatients() {
  const [patients, setPatients] = useState([]);
  const receptionistId = localStorage.getItem("uid");
  const navigate = useNavigate();

  // Fetch assigned patients
  useEffect(() => {
    const patientsRef = ref(db, "patients/");
    const unsubscribe = onValue(patientsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .map(([id, value]) => ({ id, ...value }))
        .filter((p) => p.assignedReceptionist === receptionistId)
        .sort((a, b) => a.assignedDoctorName.localeCompare(b.assignedDoctorName)); // optional sorting by doctor
      setPatients(list);
    });

    return () => unsubscribe();
  }, [receptionistId]);

  // Delete patient and adjust tokens
  const handleDelete = async (id) => {
    const patientRef = ref(db, `patients/${id}`);
    const snapshot = await new Promise((resolve) =>
      onValue(patientRef, resolve, { onlyOnce: true })
    );
    const patient = snapshot.val();
    if (!patient) return;

    const doctorId = patient.assignedDoctor;
    const tokenDeleted = patient.token;

    await remove(patientRef);

    // Decrement tokens for other patients assigned to the same doctor
    const allPatientsRef = ref(db, "patients/");
    const allSnapshot = await new Promise((resolve) =>
      onValue(allPatientsRef, resolve, { onlyOnce: true })
    );
    const allPatients = allSnapshot.val() || {};

    for (const [pId, p] of Object.entries(allPatients)) {
      if (p.assignedDoctor === doctorId && p.token > tokenDeleted) {
        await set(ref(db, `patients/${pId}/token`), p.token - 1);
      }
    }
  };

  return (
    <div className="flex bg-[#E8F0FE] min-h-screen">
      <Sidebar role="Receptionist" />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">🧾 Your Assigned Patients</h1>
        <div className="grid grid-cols-1 gap-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all"
            >
              <h3 className="text-xl font-semibold text-blue-700">
                {patient.name} (Token: {patient.token})
              </h3>
              <p className="text-gray-600 mt-1">Age: {patient.age}</p>
              <p className="text-gray-600">Disease: {patient.disease}</p>
              <p className="text-gray-600">Doctor: {patient.assignedDoctorName}</p>
              <p className="text-gray-600">Receptionist: {patient.assignedReceptionistName}</p>

              <div className="mt-4 flex gap-4">
                <Link
                  to={`/edit-patient/${patient.id}`}
                  className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  ✏ Edit
                </Link>

                <button
                  onClick={() => handleDelete(patient.id)}
                  className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
