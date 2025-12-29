"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";


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
    IAnnouncement,
    ITeacherStats,
} from "../utilsNode";
import { useAuthStore } from "./useAuthStoreNode";

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
    announcements: IAnnouncement[] | null;
    teacherStats: ITeacherStats | null;
    teacherStatsLoading: boolean;

};
type Action = {
    // Authentication actions

    // State setters
    setCourse: (course: ICourses | null) => void;
    setUserList: (users: IUser[]) => void;
    setmyCourse: (course: ICourses | null) => void;

    // Util for API calls
    fetchWithToken: (url: string, method?: string, body?: any) => Promise<any>;
    fetchRecentAnnouncements: () => Promise<IAnnouncement[]>;
    // API methods
    fetchUsers: () => Promise<IUser[]>;
    fetchAllCourses: () => Promise<ICourses[]>;
    createCourse: (details: { name: string; description: string; startDate: string }) => Promise<void>;
    getCourseById: () => Promise<void>;
    getCourseByIdFromRouter: (courseId: string) => Promise<ICourses>;
    fetchCoursesForUser: (userId: string) => Promise<void>;
    createUser: (userDetails: { firstName: string; lastName: string; email: string; role: string; courseIDs?: string[] }) => Promise<IRegisterUser>;
    createModule: (moduleDetails: { name: string; description: string; start: string; end: string; courseId: string }) => Promise<IModules>;
    createActivity: (courseId: string, moduleId: string, activityDetails: {
        name: string;
        description: string;
        start: string;
        end: string;
        moduleId: string;
    }) => Promise<IActivity>;
    fetchActivities: (courseId: string, moduleId: string) => Promise<IActivity[]>;
    uploadModuleVideo: (videoDetails: { moduleId: string; title: string; description?: string; file: File }) => Promise<any>;
    uploadSubmission: (submissionDetails: { file: File; courseId: string; activityId: string; studentName: string; moduleId: string; studentId: string, }) => Promise<any>;
    uploadUsersExcel: (file: File) => Promise<{ message: string; users: any[] }>;
    fetchModuleVideos: (moduleId: string) => Promise<IDocument[]>;
    fetchSubmissionsByActivity: (courseId: string, moduleId: string, activityId: string) => Promise<any[]>;
    fetchMySubmissionForActivity: (studentId: string) => Promise<ISubmission[]>;
    deleteSubmission: (submissionId: string) => Promise<void>;
    handleDeleteUser: (userId: string) => Promise<void>;
    deleteCourse: (courseId: string) => Promise<void>;
    deleteModule: (courseId: string, moduleId: string) => Promise<void>;
    deleteActivity: (courseId: string, moduleId: string, activityId: string) => Promise<void>;
    fetchAttendanceByCourse: (courseId: string) => Promise<ICourseUsers[]>;
    saveAttendance: (courseId: string, list: { studentId: string; isPresent: boolean; date: string }[]) => Promise<void>;
    updateSubmissionGrade: (submissionId: string, grade: string) => Promise<void>
    createAnnouncement: (title: string, message: string, teacherId: string, courseId: string) => Promise<IAnnouncement>
    deleteAnnouncement: (id: string) => Promise<void>;
    fetchAnnoucementsForCourse: (id: string) => Promise<IAnnouncement[]>;
    fetchTeacherStats: () => Promise<ITeacherStats>;


    uploadActivityDocument: (documentDetails: {
        courseId: string;
        moduleId: string;
        activityId: string;
        file: File;
        deadline?: Date | null;
    }) => Promise<any>;

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
            announcements: [],
            activities: null,
            teacherStats: null,
            teacherStatsLoading: false,


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

                // Don't send body with GET requests
                const requestInit: RequestInit = addTokenToRequestInit(tokens.accessToken, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    ...(method !== "GET" && body ? { body: JSON.stringify(body) } : {}),
                });

                try {
                    const response = await fetch(url, requestInit);

                    // Log more details for debugging
                    if (!response.ok) {
                        console.error('API Error:', {
                            url,
                            method,
                            status: response.status,
                            statusText: response.statusText
                        });

                        // Try to get error message from response
                        let errorMessage = response.statusText;
                        try {
                            const errorData = await response.json();
                            errorMessage = errorData.message || errorData.error || errorMessage;
                        } catch (e) {
                            // Couldn't parse error response
                        }

                        throw new CustomError(response.status, errorMessage);
                    }

                    // Check if there's content to parse
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        return await response.json();
                    }

                    return null;
                } catch (error) {
                    if (error instanceof CustomError) {
                        throw error;
                    }
                    throw new CustomError(500, `Network error: ${error}`);
                }
            },

            deleteAnnouncement: async (id: string): Promise<void> => {
                await get().fetchWithToken(`${BASE_URL}/announcements/${id}`, "DELETE");
                set((state) => ({
                    announcements: state.announcements?.filter((a) => a._id !== id) ?? [],
                }));
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
                if (!course?._id) return;
                const data = await get().fetchWithToken(`${BASE_URL}/courses/getCourseById/${course._id}`);
                set({ course: data });
            },

            getCourseByIdFromRouter: async (id: string) => {
                const data = await get().fetchWithToken(`${BASE_URL}/courses/getCourseById/${id}`);
                set({ course: data }); // update the course in your store
                return data;
            },


            fetchCoursesForUser: async (userId) => {
                const data = await get().fetchWithToken(
                    `${BASE_URL}/courses/${userId}/courses`
                );
                set({ myCourses: data.courses });
                console.log(data)
            },

            fetchRecentAnnouncements: async () => {
                const data = await get().fetchWithToken(`${BASE_URL}/announcements/getRecents`);
                console.log(data)
                set({ announcements: data });
                return data;
            },
            createUser: async (userDetails) => {
                try {
                    const newUser = await get().fetchWithToken(
                        `${BASE_URL}/users`,
                        "POST",
                        userDetails
                    );
                    alert("✅ User added successfully!");
                    return newUser;
                } catch (error) {
                    console.error("❌ Error creating user:", error);
                    alert("Error creating user");
                }
            },

            createAnnouncement: async (
                title,
                message,
                teacherId,
                courseId,
            ) => {
                return await get().fetchWithToken(`${BASE_URL}/announcements`, "POST", {
                    title,
                    message,
                    authorId: teacherId,
                    courseId: courseId || null,
                });
            },





            createModule: async (details: {
                name: string;
                description: string;
                start: string;
                end?: string;
                courseId: string;
            }) => {
                const { name, description, start, end, courseId } = details;

                return await get().fetchWithToken(
                    `${BASE_URL}/modules/${courseId}/modules`,
                    "POST",
                    { name, description, start, end }
                );
            },
            createActivity: async (courseId, moduleId, details) => {
                const newAct = await get().fetchWithToken(
                    `${BASE_URL}/activities/${courseId}/modules/${moduleId}`,
                    "POST",
                    details
                );

                set((s) => ({ activities: [...(s.activities ?? []), newAct.activity] }));
                alert("Activity added");
                return newAct.activity;
            },

            fetchActivities: async (courseId: string, moduleId: string) => {
                const data: IActivity[] = await get().fetchWithToken(
                    `${BASE_URL}/activities/${courseId}/modules/${moduleId}`
                );

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
                formData.append("studentId", details.studentId);
                formData.append("fileName", details.file.name);
                formData.append("studentName", details.studentName)


                console.log(details.studentName)
                const res = await fetch(
                    `${BASE_URL}/submissions/${details.courseId}/modules/${details.moduleId}/activities/${details.activityId}/submissions`,
                    {
                        method: "POST",
                        headers: { Authorization: `Bearer ${tokens?.accessToken}` },
                        body: formData,
                    }
                );

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

            fetchSubmissionsByActivity: async (courseId: string, moduleId: string, activityId: string) => {
                const tokens = useAuthStore.getState().tokens;
                if (!tokens) throw new Error("No authentication token");

                const res = await fetch(
                    `${BASE_URL}/submissions/${courseId}/modules/${moduleId}/activities/${activityId}/submissions`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${tokens.accessToken}`,
                        },
                    }
                );

                if (!res.ok) throw new Error("Failed to fetch submissions");

                const data = await res.json();

                return data;
            },
            updateSubmissionGrade: async (submissionId: string, grade: string) => {
                const res = await get().fetchWithToken(
                    `${BASE_URL}/submissions/${submissionId}/grade`,
                    "PUT",
                    { grade }
                );

                return res;
            },


            fetchMySubmissionForActivity: async (studentId) => {
                return await get().fetchWithToken(`${BASE_URL}/submissions/student/${studentId}`);
            },

            deleteSubmission: async (submissionId) => {
                await get().fetchWithToken(`${BASE_URL}/submissions/student/${submissionId}`, "DELETE");
            },

            handleDeleteUser: async (id) => {
                await get().fetchWithToken(`${BASE_URL}/users/${id}`, "DELETE");
                set((s) => ({ users: s.users?.filter((u) => u._id !== id) ?? null }));
            },

            deleteCourse: async (id) => {
                await get().fetchWithToken(`${BASE_URL}/courses/${id}`, "DELETE");
                set((s) => ({ courses: s.courses?.filter((c) => c._id !== id) ?? null }));
            },

            deleteModule: async (courseId, moduleId) => {
                await get().fetchWithToken(`${BASE_URL}/modules/${courseId}/modules/${moduleId}`, "DELETE");
                // Optionally update state if needed
            },

            deleteActivity: async (courseId, moduleId, activityId) => {
                await get().fetchWithToken(`${BASE_URL}/activities/${courseId}/modules/${moduleId}/activities/${activityId}`, "DELETE");
                set((s) => ({
                    activities: s.activities?.filter((a) => a._id !== activityId) ?? null,
                }));
            },

            uploadActivityDocument: async ({
                courseId,
                moduleId,
                activityId,
                file,
            }: {
                courseId: string;
                moduleId: string;
                activityId: string;
                file: File;
            }) => {
                const tokens = useAuthStore.getState().tokens;
                if (!tokens) throw new Error("No authentication token");

                const formData = new FormData();
                formData.append("file", file);       // Must match multer.single("file")
                formData.append("name", file.name);  // Optional, just for convenience

                console.log("Uploading document with IDs:", file, moduleId, activityId);

                const res = await fetch(
                    `${BASE_URL}/documents/${courseId}/modules/${moduleId}/activities/${activityId}/documents`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${tokens.accessToken}`,
                            // ❌ Do NOT set Content-Type manually for FormData!
                        },
                        body: formData,
                    }
                );

                if (!res.ok) {
                    const text = await res.text(); // get response body for debugging
                    console.error("Upload failed response:", text);
                    throw new Error("Failed to upload document");
                }

                return res.json();
            },

            fetchAnnoucementsForCourse: async (courseId: string): Promise<IAnnouncement[]> => {
                set({ announcements: [] });
                const data = await get().fetchWithToken(`${BASE_URL}/announcements/course/${courseId}`);
                set({ announcements: data });
                return data;
            },




            fetchAttendanceByCourse: async (courseId) => {
                return await get().fetchWithToken(`${BASE_URL}/courses/${courseId}/attendance`);
            },

            saveAttendance: async (courseId, list) => {
                await get().fetchWithToken(`${BASE_URL}/courses/${courseId}/attendance`, "POST", list);
                alert("Attendance saved successfully!");
            },

            fetchTeacherStats: async () => {
                set({ teacherStatsLoading: true });
                const data = await get().fetchWithToken(`${BASE_URL}/teacher/stats`);
                set({ teacherStats: data, teacherStatsLoading: false });
                return data;
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