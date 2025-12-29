"use-client";

import { ReactElement, useState } from 'react';
import { useApiDataStore } from '../../storesNode/apiDataStore';



export function AddModuleForm({ onSuccess, courseId: initialCourseId }: { onSuccess?: () => void, courseId?: string }) {
  const { createModule,myCourses } = useApiDataStore();

  const [courseId, setCourseId] = useState(initialCourseId || "");


  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      setError("Please select a course.");
      return;
    }

    const formData = {
      name,
      description,
      start,
      end,
      courseId,
    };

    try {
      await createModule(formData);
      setError(null); // Clear error

      setName("");
      setDescription("");
      setStart("");
      setEnd("");

      if (!initialCourseId) setCourseId("");

      if (onSuccess) onSuccess();

      alert("Module created successfully!");
    } catch (err) {
      setError("Error creating module, please try again.");
      console.error("Error creating module:", err);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="p-4">

      {/* Show dropdown only if courseId was NOT passed */}
      {!initialCourseId && (
        <div className="form-group mb-3">
          <label>Select Course</label>
          <select
            className="form-select"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
          >
            <option value="">-- Choose a course --</option>
            {myCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="form-group mb-3">
        <label htmlFor="name" className="form-label">Name</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control"
          id="name"
          placeholder="Enter module name"
          required
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-control"
          id="description"
          placeholder="Enter module description"
          required
        />
      </div>


      <div className="form-group mb-3">
        <label htmlFor="start" className="form-label">Start Date</label>
        <input
          type="date"
          name="start"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="form-control"
          id="start"
          required
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="end" className="form-label">End Date</label>
        <input
          type="date"
          name="end"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="form-control"
          id="end"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
}

