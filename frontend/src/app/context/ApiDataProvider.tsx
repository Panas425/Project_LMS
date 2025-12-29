"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import {
  BASE_URL,
  IUser,
  ICourses,
  IUserLoggedIn,
  addTokenToRequestInit,
  CustomError,
  ICourseUsers,
  ICourseIds,
  IUserCourses,
  IModules,
  IActivity,
  IDocument,
  ISubmission,
  IRegisterUser,
} from "../utils";
import { useAuthContext } from "../hooks";
import { jwtDecode } from "jwt-decode";

interface IApiData {
  user: IUserLoggedIn | null;
  users: IUser[] | null;
  userList: IUser[] | null;
  myCourseuserList: IUser[] | null;
  course: ICourses | null;
  myCourse: ICourses | null;
  courses: ICourses[] | null;
  userCourses: ICourseUsers[] | null;
  loading: boolean;
  error: string | null;
  courseIds: ICourseIds[] | null;
  myCourses: ICourses[];

  uploadModuleVideo: (videoDetails: {
    moduleId: string;
    title: string;
    description?: string;
    file: File;
  }) => Promise<void>;

  uploadSubmission: (submissionDetails: {
    file: File;
    activityId: string;
    studentName: string;
    deadline?: Date | null;
  }) => Promise<any>;

  getCourseByIdFromRouter: (courseId: string) => Promise<ICourses>;
  activities: IActivity[] | null;
  setmyCourse: (course: ICourses | null) => void;
  setUserList: (users: IUser[]) => void;
  getCourseById: () => Promise<void>;
  fetchModuleVideos: (moduleId: string) => Promise<IDocument[]>;
  fetchCoursesForUser: (userId: string) => Promise<void>;
  setCourse: React.Dispatch<React.SetStateAction<ICourses | null>>;
  createCourse: (courseDetails: {
    name: string;
    description: string;
    startDate: string;
  }) => Promise<void>;
  fetchUsersByCourse: (courseId: string) => Promise<ICourseUsers[]>;
  fetchUsersMyCourse: (id: string) => Promise<void>;
  fetchUsersByCourseId: (courseId: string) => Promise<void>;
  fetchUsers: () => Promise<IUser[]>;
  createUser: (userDetails: {
    FirstName: string;
    LastName: string;
    Email: string;
    Role: string;
    CourseIDs: string[];
  }) => Promise<IRegisterUser>;
  createModule: (moduleDetails: {
    name: string;
    description: string;
    start: string;
    end: string;
    courseID: string;
  }) => Promise<IModules>;
  createActivity: (activityDetails: {
    name: string;
    description: string;
    activityType: string;
    start: string;
    end: string;
    moduleID: string;
  }) => Promise<IActivity>;
  fetchAllCourses: () => Promise<ICourses[]>;
  fetchCourse: (id: string) => Promise<void>;
  fetchUsersWithCourses: () => Promise<ICourseUsers[]>;
  deleteSubmission: (submissionId: string) => Promise<void>;
  fetchSubmissionsByActivity: (activityId: string) => Promise<any[]>;

  fetchMySubmissionForActivity: (userId: string) => Promise<ISubmission[]>;
  fetchActivities: (moduleId: string) => Promise<IActivity[]>;
  uploadUsersExcel: (file: File) => Promise<{ message: string; users: any[] }>;
  handleDeleteUser: (userId: string) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  deleteModule: (moduleId: string) => Promise<void>;
  deleteActivity: (actId: string) => Promise<void>;
  fetchAttendanceByCourse: (courseId: string) => Promise<ICourseUsers[]>;
  saveAttendance: (
    courseId: string,
    attendanceList: { studentId: string; isPresent: boolean; date: string }[]
  ) => Promise<void>;
}

interface JwtPayload {
  exp: number;
  iat: number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  [key: string]: any; // Index signature
}

interface ApiDataProviderProps {
  children: ReactNode;
}

export const ApiDataContext = createContext<IApiData>({} as IApiData);

export const ApiDataProvider = ({ children }: ApiDataProviderProps) => {
  const [users, setUsers] = useState<IUser[] | null>(null);
  const [userList, setUserList] = useState<IUser[] | null>(null);
  const [myCourseuserList, myCoursesetUserList] = useState<IUser[] | null>(
    null
  );
  const [course, setCourse] = useState<ICourses | null>(null);
  const [myCourse, setmyCourse] = useState<ICourses | null>(null);
  const [courses, setCourses] = useState<ICourses[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<IUserLoggedIn | null>(null);
  const [userCourses, setUserCourses] = useState<ICourseUsers[] | null>(null);
  const [activities, setActivities] = useState<IActivity[] | null>(null);
  const { tokens, isLoggedIn } = useAuthContext();
  const [courseIds] = useState<ICourseIds[] | null>(null);
  const [isModuleAdded, setIsModuleAdded] = useState(false);

  const [myCourses, setMyCourses] = useState<ICourses[]>([]);

  const fetchWithToken = async (
    url: string,
    method: string = "GET",
    body?: any
  ): Promise<any> => {
    if (!tokens) {
      throw new CustomError(401, "No tokens available for authentication.");
    }

    const requestInit: RequestInit = addTokenToRequestInit(tokens.accessToken, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null, // Only include body if there's data to send
    });

    const response = await fetch(url, requestInit);

    if (!response.ok) {
      throw new CustomError(response.status, response.statusText);
    }

    // Check if there's content to parse
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json(); // Parse JSON response
    }

    return null; // No content to return
  };

  const createCourse = async (courseDetails: {
    name: string;
    description: string;
    startDate: string;
  }): Promise<void> => {
    const url = `${BASE_URL}/courses`;
    try {
      const newCourse = await fetchWithToken(url, "POST", courseDetails);
      setCourses((prevCourses) =>
        Array.isArray(prevCourses) ? [...prevCourses, newCourse] : [newCourse]
      );
      alert("Course added");
    } catch (error) {
      alert("Error creating course:" + error);
      throw error;
    }
  };

  const getCourseById = async () => {
    if (!course?.id) return;

    try {
      const courseData = await fetchWithToken(
        `${BASE_URL}/courses/getCourseById/${course?.id}`
      );
      setCourse(courseData);
      localStorage.setItem("course", JSON.stringify(courseData));
    } catch (err) {
      if (err instanceof CustomError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while fetching course.");
      }
    }
  };

  const fetchAttendanceByCourse = async (courseId: string) => {
    const data = await fetchWithToken(
      `${BASE_URL}/courses/${courseId}/attendance`
    );
    return data; // returnerar [{ studentId, isPresent, date }]
  };

  const uploadSubmission = async (submissionDetails: {
    file: File;
    activityId: string;
    studentName: string;
    deadline?: Date | null;
  }): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("file", submissionDetails.file);
      formData.append("activityId", submissionDetails.activityId);
      formData.append("name", submissionDetails.studentName);
      if (submissionDetails.deadline) {
        // Format deadline to ISO string expected by backend
        formData.append("deadline", submissionDetails.deadline.toISOString());
      }

      const response = await fetch(`${BASE_URL}/submissions/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
          // Do not set Content-Type here; let the browser set multipart boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      return data; // Return the created submission
    } catch (error) {
      console.error("Error uploading submission:", error);
      throw error;
    }
  };

const getCourseByIdFromRouter = async (
  courseId: string
): Promise<ICourses & { students: ICourseUsers[] }> => {
  try {
    const courseData = await fetchWithToken(
      `${BASE_URL}/courses/getCourseById/${courseId}`
    );

    const userCourses = courseData.userCourse || [];
    const attendances = courseData.attendances || [];

    // Map each student from userCourse and merge with attendance info
    const students: ICourseUsers[] = userCourses.map((uc: any) => {
      const attendanceRecord = attendances.find(
        (a: any) => a.courseId === uc.courseId && a.firstName === uc.firstName
      );

      return {
        studentId: uc.studentId,
        firstName: uc.firstName,
        lastName: uc.lastName,
        courseid: uc.courseId, // match your interface
        ispresent: attendanceRecord
          ? attendanceRecord.isPresent
          : uc.isPresent ?? false,
      };
    });

    console.log("✅ Students fetched:", students);

    return {
      ...courseData,
      students,
    };
  } catch (err) {
    if (err instanceof CustomError) {
      throw new Error(err.message);
    } else {
      throw new Error("An unexpected error occurred while fetching course.");
    }
  }
};






  const uploadUsersExcel = async (
    file: File
  ): Promise<{ message: string; users: any[] }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_URL}/authentication/upload-users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      return {
        message: data.message || "Upload successful!",
        users: data.users || [],
      };
    } catch (error) {
      console.error("Error uploading users Excel:", error);
      throw error;
    }
  };

  const saveAttendance = async (
    courseId: string,
    attendanceList: { studentId: string; isPresent: boolean; date: string }[]
  ): Promise<void> => {
    try {
      await fetchWithToken(
        `${BASE_URL}/courses/${courseId}/attendance`,
        "POST",
        attendanceList
      );
      alert("Attendance saved successfully!");
    } catch (err) {
      if (err instanceof CustomError) {
        console.error("Error saving attendance:", err.message);
        alert(err.message);
      } else {
        console.error("Unexpected error:", err);
        alert("An unexpected error occurred while saving attendance.");
      }
    }
  };

  const createUser = async (userDetails: {
    FirstName: string;
    LastName: string;
    Email: string;
    Role: string;
    CourseIDs?: string[];
  }): Promise<IRegisterUser> => {
    const url = `${BASE_URL}/authentication`;
    try {
      const newUser = await fetchWithToken(url, "POST", userDetails);
      alert("User added");
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const createModule = async (moduleDetails: {
    name: string;
    description: string;
    start: string;
    end: string;
    courseID: string;
  }): Promise<IModules> => {
    const url = `${BASE_URL}/modules`;
    try {
      const newModule = await fetchWithToken(url, "POST", moduleDetails);
      return newModule;
    } catch (error) {
      console.error("Error creating module:", error);
      throw error;
    }
  };

  const createActivity = async (activityDetails: {
    name: string;
    description: string;
    activityType: string;
    start: string;
    end: string;
    moduleID: string;
  }): Promise<IActivity> => {
    const url = `${BASE_URL}/activities`;

    try {
      const newActivity: IActivity = await fetchWithToken(
        url,
        "POST",
        activityDetails
      );

      setActivities((prevActivity) =>
        Array.isArray(prevActivity)
          ? [...prevActivity, newActivity]
          : [newActivity]
      );

      alert("Activity added");
      return newActivity; // ✅ Return created activity
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  };

  const fetchUsersWithCourses = async (): Promise<ICourseUsers[]> => {
    if (!course || !course.id) return []; // Return an empty array instead of void

    try {
      const response = await fetchWithToken(`${BASE_URL}/courses/usercourses`);
      console.log("Fetched user courses:", response);

      // Ensure the response is of the expected type before setting the state
      if (Array.isArray(response)) {
        setUserCourses(response); // Assuming you have a state to hold this data
        return response; // Return the valid response
      } else {
        console.error("Unexpected response format:", response);
        return []; // Return an empty array in case of unexpected format
      }
    } catch (err) {
      // Handle errors as needed
      console.error("Error fetching user courses:", err);
      return []; // Return an empty array in case of error
    }
  };

  const deleteSubmission = async (submissionId: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/submissions/${submissionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${errorText}`);
      }

      // Optionally: return true/false if you want
      return;
    } catch (err) {
      console.error("Error deleting submission:", err);
      throw err;
    }
  };

  const fetchActivities = async (moduleId: string): Promise<IActivity[]> => {
    try {
      const activities = await fetchWithToken(
        `${BASE_URL}/activities/moduleid/${moduleId}`
      );
      setActivities(activities); // still update the context state
      return activities; // <-- return them so the type matches
    } catch (err) {
      console.error("Error fetching activities for module:", err);
      setActivities([]);
      return []; // <-- return empty array on error
    }
  };

  const fetchCoursesForUser = async (userId: string) => {
    try {
      const data: IUserCourses = await fetchWithToken(
        `${BASE_URL}/courses/${userId}/courses`
      );
      setMyCourses(data.courses); // store all courses
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchAllCourses = async (): Promise<ICourses[]> => {
    try {
      const courseData = await fetchWithToken(`${BASE_URL}/courses`);
      setCourses(courseData);
      return courseData;
    } catch (err) {
      if (err instanceof CustomError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while fetching courses.");
      }
      return [];
    }
  };

  const fetchUsersByCourse = async (
    courseId: string
  ): Promise<ICourseUsers[]> => {
    if (!courseId) {
      return [];
    }
    try {
      const response = await fetchWithToken(
        `${BASE_URL}/courses/${courseId}/students/`
      );
      // Validera och returnera data
      if (Array.isArray(response)) {
        return response;
      } else {
        return [];
      }
    } catch (error) {
      // Hantera fel
      return [];
    }
  };
  const fetchUsersMyCourse = async (user_id: string) => {
    try {
      const usersData: IUser[] = await fetchWithToken(
        `${BASE_URL}/users/courses/${user_id}`
      );
      setUserList(usersData);
      localStorage.setItem("userList", JSON.stringify(usersData));
    } catch (err) {
      if (err instanceof CustomError) setError(err.message);
      else setError("An unexpected error occurred while fetching users.");
    }
  };

  const fetchUsersByCourseId = async (courseId: string) => {
    try {
      const usersData = await fetchWithToken(
        `${BASE_URL}/users/courses/${courseId}`
      );
      //setUserList(usersData);
      setmyCourse(usersData);
    } catch (err) {
      if (err instanceof CustomError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while fetching users.");
      }
    }
  };

  const fetchUsers = async (): Promise<IUser[]> => {
    try {
      const usersData = await fetchWithToken(`${BASE_URL}/users`);
      setUsers(usersData); // Update the state with fetched users
      return usersData; // Return the fetched data
    } catch (err) {
      // Handle error and set the error state
      if (err instanceof CustomError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while fetching users.");
      }
      return []; // Ensure that the return type is consistent
    }
  };

  const fetchCourse = async (userId: string) => {
    try {
      const data = await fetchWithToken(
        `${BASE_URL}/courses/${userId}/courses`
      );
      setmyCourse(data || null);
    } catch (err) {
      if (err instanceof CustomError) setError(err.message);
      else setError("An unexpected error occurred while fetching courses.");
    }
  };

  const uploadModuleVideo = async (videoDetails: {
    moduleId: string;
    title: string;
    description?: string;
    file: File;
  }) => {
    try {
      const formData = new FormData();
      formData.append("ModuleId", videoDetails.moduleId);
      formData.append("Title", videoDetails.title);
      if (videoDetails.description)
        formData.append("Description", videoDetails.description);
      formData.append("File", videoDetails.file);

      const response = await fetch(`${BASE_URL}/Documents/upload-video`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      // ✅ Parse uploaded video info
      const uploadedVideo = await response.json();

      // ✅ Automatically refresh video list for the same module
      await fetchModuleVideos(videoDetails.moduleId);

      // ✅ Return uploaded video (optional)
      return uploadedVideo;
    } catch (err) {
      console.error("Error uploading module video:", err);
      throw err;
    }
  };

  const fetchSubmissionsByActivity = async (
    activityId: string
  ): Promise<any[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/submissions/activity/${activityId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch submissions: ${errorText}`);
      }

      const data = await response.json();
      console.log(data);
      return data; // Array of submissions
    } catch (err) {
      console.error("Error fetching submissions:", err);
      return []; // Return empty array on error
    }
  };

  const fetchMySubmissionForActivity = async (
    userId: string
  ): Promise<ISubmission[]> => {
    if (!userId) return [];

    try {
      const data: ISubmission[] = await fetchWithToken(
        `${BASE_URL}/submissions/student/${userId}`
      );
      console.log(data);
      return data;
    } catch (err) {
      console.error("Error fetching submissions:", err);
      return [];
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Corrected API URL to point to the user endpoint
      const url = `${BASE_URL}/users/${userId}`;

      // Use fetchWithToken with the DELETE method, no body is necessary for deletion
      await fetchWithToken(url, "DELETE");

      // Remove the user from the list on success
      const updatedUsers = users?.filter((user) => user.id !== userId);

      setUsers(updatedUsers!);
    } catch (error) {
      console.error("Error deleting user:", error);
      // Handle error, show a message to the user if necessary
    }
  };
  const fetchModuleVideos = async (moduleId: string): Promise<IDocument[]> => {
    try {
      const videos: IDocument[] = await fetchWithToken(
        `${BASE_URL}/documents?moduleId=${moduleId}`
      );
      return videos || [];
    } catch (err) {
      console.error("Error fetching videos for module:", err);
      return [];
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      // Corrected API URL to point to the user endpoint
      const url = `${BASE_URL}/courses/${courseId}`;

      // Use fetchWithToken with the DELETE method, no body is necessary for deletion
      await fetchWithToken(url, "DELETE");

      // Remove the user from the list on success
      const updatedCourses = courses?.filter(
        (course) => course.id !== courseId
      );

      setCourses(updatedCourses!);
    } catch (error) {
      console.error("Error deleting user:", error);
      // Handle error, show a message to the user if necessary
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      const url = `${BASE_URL}/modules/${moduleId}`;
      await fetchWithToken(url, "DELETE");

      const updatedCourses = courses?.map((course) => {
        const filteredModules = course.modules.filter(
          (module) => module.id !== moduleId
        );
        return { ...course, modules: filteredModules };
      });

      setCourses(updatedCourses!); // Update the state with the new courses
    } catch (error) {
      console.error("Error deleting module:", error);
    }
  };

  const deleteActivity = async (actId: string) => {
    try {
      const url = `${BASE_URL}/activities/${actId}`;
      await fetchWithToken(url, "DELETE");

      // Update the state to remove the deleted activity
      const updatedCourses = courses?.map((course) => {
        // Update the modules in each course
        const updatedModules = course.modules.map((module) => {
          // Filter out the activity with the given actId
          const filteredActivities = module.activities.filter(
            (activity) => activity.id !== actId
          );

          return {
            ...module,
            activities: filteredActivities, // Update the activities in the module
          };
        });

        return {
          ...course,
          modules: updatedModules, // Update the modules in the course
        };
      });

      setCourses(updatedCourses!); // Update the state with the new courses

      // If activities are also being managed in a separate state, update it here
      setActivities(
        (prevActivities) =>
          prevActivities?.filter((activity) => activity.id !== actId) || null
      );
    } catch (error) {
      console.error("Error deleting activity:", error);
      // Handle error, show a message to the user if necessary
    }
  };

  useEffect(() => {
    if (tokens) {
      const decode = jwtDecode<JwtPayload>(tokens.accessToken);
      const id =
        decode[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ]!;
      const name =
        decode[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ]!.toLowerCase();
      const role =
        decode[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ]!.toLowerCase();
      console.log(role);
      setUser({ id, name, role });
    }
  }, [tokens]);

  useEffect(() => {
    if (user) {
      console.log("User:", user); // Log user after it has been updated
    }
  }, [user]);

  useEffect(() => {
    const storedCourse = localStorage.getItem("course");
    const storedUserList = localStorage.getItem("userList");

    if (storedCourse) {
      setCourse(JSON.parse(storedCourse));
    }

    if (storedUserList) {
      setUserList(JSON.parse(storedUserList));
    }
  }, []);

  useEffect(() => {
    setLoading(!userList || !course);
  }, [userList, course]);

  useEffect(() => {
    if (isModuleAdded) {
      // Update localStorage only if a new module has been added
      if (course) {
        localStorage.setItem("course", JSON.stringify(course));
      }
      if (userList) {
        localStorage.setItem("userList", JSON.stringify(userList));
      }
      setIsModuleAdded(false); // Reset the flag after updating
    }
  }, [isModuleAdded, course, userList]);

  return (
    <ApiDataContext.Provider
      value={{
        user,
        users,
        userList,
        course,
        myCourse,
        courses,
        myCourseuserList,
        userCourses,
        loading,
        activities,
        error,
        courseIds,
        myCourses,
        uploadModuleVideo,
        createUser,
        setmyCourse,
        fetchModuleVideos,
        fetchAttendanceByCourse,
        deleteActivity,
        uploadUsersExcel,
        setUserList,
        uploadSubmission,
        handleDeleteUser,
        fetchCoursesForUser,
        fetchCourse,
        fetchAllCourses,
        createModule,
        fetchUsersMyCourse,
        fetchActivities,
        createActivity,
        saveAttendance,
        deleteModule,
        getCourseById,
        fetchUsersWithCourses,
        fetchSubmissionsByActivity,
        fetchMySubmissionForActivity,
        fetchUsers,
        setCourse,
        createCourse,
        fetchUsersByCourse,
        deleteSubmission,
        fetchUsersByCourseId,
        getCourseByIdFromRouter,
        deleteCourse,
      }}
    >
      {children}
    </ApiDataContext.Provider>
  );
};
