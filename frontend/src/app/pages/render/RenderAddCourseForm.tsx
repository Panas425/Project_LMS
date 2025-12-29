import { ReactElement, useState } from "react";
import { useApiDataStore } from "../../storesNode/apiDataStore";


export function AddCourseForm(): ReactElement {

  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const { createCourse } = useApiDataStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const courseData = {
      name: courseName,
      description: courseDescription,
      startDate,
    };
    
    createCourse(courseData);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="formGroupExampleInput">Course Name</label>
          <input
            type="text"
            className="form-control"
            id="formGroupExampleInput"
            placeholder="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)} // Update the state on input change
          />
        </div>

        <div className="form-group">
          <label htmlFor="exampleFormControlTextarea1">Course Description</label>
          <textarea
            className="form-control"
            id="exampleFormControlTextarea1"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)} // Update the state on textarea change
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="courseStartDate">Start Date</label>
          <input
            type="date"
            className="form-control"
            id="courseStartDate"
            placeholder="Select Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)} // Update the state on date change
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Add Course
        </button>
      </form>
    </>
  );
}
