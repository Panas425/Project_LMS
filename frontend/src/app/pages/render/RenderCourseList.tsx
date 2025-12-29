import { CourseCard } from "../../components";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiDataStore } from "../../storesNode/apiDataStore";
import { useAuthStore } from "../../storesNode/useAuthStoreNode";


export function RenderCourseList() {
  const {
    myCourses,
    setCourse,
    fetchCoursesForUser,
  } = useApiDataStore();
  const { user: user } = useAuthStore();
  const router = useRouter();
  const [hasFetchedData, setHasFetchedData] = useState(false);


  const handleClick = (course: any) => {
    setCourse(course);
    router.push(`/course/${course._id}`);
  };

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

  return (
    <>
      {myCourses && myCourses.length > 0 ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {myCourses.map((course) => (
            <div key={course._id} className="col">
              <div
                className="card h-100 shadow-sm border-0 hover-shadow cursor-pointer"
                onClick={() => handleClick(course)}
              >
                <CourseCard course={course}  />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info text-center">
          No courses available.
        </div>
      )}
    </>
  );
}
