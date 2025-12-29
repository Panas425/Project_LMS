import { ReactElement, useContext, useState } from "react";
import { useApiDataStore } from "../../storesNode/apiDataStore";


export function AddUserForm(): ReactElement {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { courses, createUser } = useApiDataStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !role || !email) {
      setError("All fields are required.");
      return;
    }

    if (role.toLowerCase() === "student" && selectedCourses.length === 0) {
      setError("Students must be assigned at least one course.");
      return;
    }

    // Send only required info to backend
    const userData = {
      firstName: firstName,
      lastName: lastName,
      email: email.toLowerCase(),
      role: role,
      courseIDs: role.toLowerCase() === "student" ? selectedCourses : [],
    };

    try {
      await createUser(userData);
      setError(null);
      setFirstName("");
      setLastName("");
      setRole("");
      setSelectedCourses([]);
    } catch (err) {
      console.error("Error creating user:", err);
      setError("Failed to create user. Please check the data and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded shadow-sm bg-light">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">First Name</label>
        <input
          type="text"
          className="form-control"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Last Name</label>
        <input
          type="text"
          className="form-control"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Role</label>
        <select
          className="form-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="Teacher">Teacher</option>
          <option value="Student">Student</option>
        </select>
      </div>

      {role.toLowerCase() === "student" && courses && (
        <div className="mb-3">
          <label className="form-label">Assign Courses</label>
          <select
            multiple
            className="form-select"
            value={selectedCourses}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedCourses(selected);
            }}
          >
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.name}</option>
            ))}
          </select>
        </div>
      )}

      <button type="submit" className="btn btn-primary w-100">
        Create User
      </button>
    </form>
  );
}
