"use client";

import { ReactElement, useContext, useEffect, useState } from "react";
import { ModuleCard } from "../../components/ModuleCard";
import "../../styles/MyCoursePage.css";
import { useApiDataStore } from "../../storesNode/apiDataStore";
import { useAuthStore } from "../../storesNode/useAuthStoreNode";


export function RenderMyCoursePage(): ReactElement {
  const { myCourses, fetchCoursesForUser } = useApiDataStore();
  const { user: user } = useAuthStore();
  const [hasFetchedData, setHasFetchedData] = useState(false);

  // Fetch courses when user is available
  useEffect(() => {
    if (!user || hasFetchedData) return;

    const fetchData = async () => {
      try {
        await fetchCoursesForUser(user._id);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setHasFetchedData(true);
      }
    };

    fetchData();
  }, [user, hasFetchedData, fetchCoursesForUser]);

  if (!user) return <p>Loading user...</p>;
  if (!myCourses || myCourses.length === 0) return <p>Loading courses...</p>;

  return (
    <main className="home-section">
      <p className="student-identity">{"Hi, " + user.name}</p>

      {/* Container for all courses */}
      <div className="course-grid">
        {myCourses.map((course) => (
          <div key={course._id} className="course-card">
            <p className="title">{course.name}</p>

            <section className="module-section">
              {course.modules && course.modules.length > 0 ? (
                <div className="module-grid">
                  {course.modules.map((module) => (
                    <div key={module._id} className="module-card">
                      <ModuleCard course={course} module={module} />
                    </div>
                  ))}
                </div>
              ) : (
                <p>No modules available for this course.</p>
              )}
            </section>
          </div>
        ))}
      </div>
    </main>

  );
}
