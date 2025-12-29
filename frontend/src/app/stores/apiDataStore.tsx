"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "../stores/useAuthStore";

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
    ITokens,
    IJwtPayload,
} from "../utils";

// ========================= Types =========================


type State = {
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
    activities: IActivity[] | null;
};
type Action = {
    // Authentication actions

    // State setters
    setCourse: (course: ICourses | null) => void;
    setUserList: (users: IUser[]) => void;
    setmyCourse: (course: ICourses | null) => void;

    // Util for API calls
    fetchWithToken: (url: string, method?: string, body?: any) => Promise<any>;

    // API methods
    fetchUsers: () => Promise<IUser[]>;
    fetchAllCourses: () => Promise<ICourses[]>;
    createCourse: (details: { name: string; description: string; startDate: string }) => Promise<void>;
    getCourseById: () => Promise<void>;
    getCourseByIdFromRouter: (courseId: string) => Promise<ICourses>;
    fetchCoursesForUser: (userId: string) => Promise<void>;
    createUser: (userDetails: { FirstName: string; LastName: string; Email: string; Role: string; CourseIDs?: string[] }) => Promise<IRegisterUser>;
    createModule: (moduleDetails: { name: string; description: string; start: string; end: string; courseID: string }) => Promise<IModules>;
    createActivity: (activityDetails: { name: string; description: string; activityType: string; start: string; end: string; moduleID: string }) => Promise<IActivity>;
    fetchActivities: (moduleId: string) => Promise<IActivity[]>;
    uploadModuleVideo: (videoDetails: { moduleId: string; title: string; description?: string; file: File }) => Promise<any>;
    uploadSubmission: (submissionDetails: { file: File; activityId: string; studentName: string; deadline?: Date | null }) => Promise<any>;
    uploadUsersExcel: (file: File) => Promise<{ message: string; users: any[] }>;
    fetchModuleVideos: (moduleId: string) => Promise<IDocument[]>;
    fetchSubmissionsByActivity: (activityId: string) => Promise<any[]>;
    fetchMySubmissionForActivity: (userId: string) => Promise<ISubmission[]>;
    deleteSubmission: (submissionId: string) => Promise<void>;
    handleDeleteUser: (userId: string) => Promise<void>;
    deleteCourse: (courseId: string) => Promise<void>;
    deleteModule: (moduleId: string) => Promise<void>;
    deleteActivity: (actId: string) => Promise<void>;
    fetchAttendanceByCourse: (courseId: string) => Promise<ICourseUsers[]>;
    saveAttendance: (courseId: string, list: { studentId: string; isPresent: boolean; date: string }[]) => Promise<void>;
}

export const useApiDataStore = create<State & Action>()(
    persist(
        (set, get) => ({

            users: null,
            userList: null,
            myCourseuserList: null,
            course: null,
            myCourse: null,
            courses: null,
            userCourses: null,
            loading: true,
            error: null,
            courseIds: null,
            myCourses: [],
            activities: null,

            setCourse: (course) => set({ course }),
            setUserList: (users) => set({ userList: users }),
            setmyCourse: (course) => set({ myCourse: course }),

            // ================== UTILS ==================
            fetchWithToken: async (
                url: string,
                method: string = "GET",
                body?: any

            ): Promise<any> => {
                const tokens = useAuthStore.getState().tokens;
                
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
            },

            // ================== API ACTIONS ==================
            fetchUsers: async () => {
                const data = await get().fetchWithToken(`${BASE_URL}/users`);
                set({ users: data });
                return data;
            },

            fetchAllCourses: async () => {
                const data = await get().fetchWithToken(`${BASE_URL}/courses`);
                set({ courses: data });
                return data;
            },

            createCourse: async (details) => {
                const newCourse = await get().fetchWithToken(`${BASE_URL}/courses`, "POST", details);
                set((s) => ({ courses: [...(s.courses ?? []), newCourse] }));
                alert("Course added");
            },

            getCourseById: async () => {
                const course = get().course;
                if (!course?.id) return;
                const data = await get().fetchWithToken(`${BASE_URL}/courses/getCourseById/${course.id}`);
                set({ course: data });
            },

            getCourseByIdFromRouter: async (id) => {
                const data = await get().fetchWithToken(`${BASE_URL}/courses/getCourseById/${id}`);
                return data;
            },

            fetchCoursesForUser: async (userId) => {
                const data: IUserCourses = await get().fetchWithToken(
                    `${BASE_URL}/courses/${userId}/courses`
                );
                set({ myCourses: data.courses });
            },


            createUser: async (userDetails) => {
                const newUser = await get().fetchWithToken(`${BASE_URL}/authentication`, "POST", userDetails);
                alert("User added");
                return newUser;
            },

            createModule: async (details) => {
                return await get().fetchWithToken(`${BASE_URL}/modules`, "POST", details);
            },

            createActivity: async (details) => {
                const newAct = await get().fetchWithToken(`${BASE_URL}/activities`, "POST", details);
                set((s) => ({ activities: [...(s.activities ?? []), newAct] }));
                alert("Activity added");
                return newAct;
            },

            fetchActivities: async (moduleId) => {
                const data: IActivity[] = await get().fetchWithToken(`${BASE_URL}/activities/moduleid/${moduleId}`);
                set({ activities: data });
                return data;
            },

            uploadModuleVideo: async (details) => {
                const tokens = useAuthStore.getState().tokens;
                const formData = new FormData();
                formData.append("ModuleId", details.moduleId);
                formData.append("Title", details.title);
                if (details.description) formData.append("Description", details.description);
                formData.append("File", details.file);
                const res = await fetch(`${BASE_URL}/Documents/upload-video`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${tokens?.accessToken}` },
                    body: formData,
                });
                if (!res.ok) throw new Error("Video upload failed");
                return res.json();
            },

            uploadSubmission: async (details) => {
                const tokens = useAuthStore.getState().tokens;
                const formData = new FormData();
                formData.append("file", details.file);
                formData.append("activityId", details.activityId);
                formData.append("name", details.studentName);
                if (details.deadline) formData.append("deadline", details.deadline.toISOString());
                const res = await fetch(`${BASE_URL}/submissions/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${tokens?.accessToken}` },
                    body: formData,
                });
                if (!res.ok) throw new Error("Submission upload failed");
                return res.json();
            },

            uploadUsersExcel: async (file) => {
                const tokens = useAuthStore.getState().tokens;
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch(`${BASE_URL}/authentication/upload-users`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${tokens?.accessToken}` },
                    body: formData,
                });
                if (!res.ok) throw new Error("Upload failed");
                return res.json();
            },

            fetchModuleVideos: async (moduleId) => {
                return await get().fetchWithToken(`${BASE_URL}/documents?moduleId=${moduleId}`);
            },

            fetchSubmissionsByActivity: async (id) => {
                const tokens = useAuthStore.getState().tokens;
                const res = await fetch(`${BASE_URL}/submissions/activity/${id}`, {
                    headers: { Authorization: `Bearer ${tokens?.accessToken}` },
                });
                if (!res.ok) throw new Error("Failed to fetch submissions");
                return res.json();
            },

            fetchMySubmissionForActivity: async (userId) => {
                return await get().fetchWithToken(`${BASE_URL}/submissions/student/${userId}`);
            },

            deleteSubmission: async (id) => {
                const tokens = useAuthStore.getState().tokens;
                await fetch(`${BASE_URL}/submissions/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${tokens?.accessToken}` },
                });
            },

            handleDeleteUser: async (id) => {
                await get().fetchWithToken(`${BASE_URL}/users/${id}`, "DELETE");
                set((s) => ({ users: s.users?.filter((u) => u.id !== id) ?? null }));
            },

            deleteCourse: async (id) => {
                await get().fetchWithToken(`${BASE_URL}/courses/${id}`, "DELETE");
                set((s) => ({ courses: s.courses?.filter((c) => c.id !== id) ?? null }));
            },

            deleteModule: async (id) => {
                await get().fetchWithToken(`${BASE_URL}/modules/${id}`, "DELETE");
                // Optionally update state if needed
            },

            deleteActivity: async (id) => {
                await get().fetchWithToken(`${BASE_URL}/activities/${id}`, "DELETE");
                set((s) => ({
                    activities: s.activities?.filter((a) => a.id !== id) ?? null,
                }));
            },

            fetchAttendanceByCourse: async (courseId) => {
                return await get().fetchWithToken(`${BASE_URL}/courses/${courseId}/attendance`);
            },

            saveAttendance: async (courseId, list) => {
                await get().fetchWithToken(`${BASE_URL}/courses/${courseId}/attendance`, "POST", list);
                alert("Attendance saved successfully!");
            },
        }),
        {
            name: "api-data-store",
            partialize: (state) => ({
                course: state.course,
                userList: state.userList,
                courses: state.courses,
            }),
        }
    )
);