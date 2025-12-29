import { JwtPayload } from "jwt-decode";
import { CustomError } from "./classes";

export interface IAuthContext {
  tokens: ITokens | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<ITokens | CustomError | undefined>;
  logout: () => void;
  user: IUserLoggedIn | null;
}

export interface ITokens {
  accessToken: string;
  refreshToken?: string;
}

export interface IDocument {
  id: string;
  name: string;
  fileUrl: string;
  type: "Video" | "Other";
  uploadedAt: string;
  moduleId: string;
  courseId: string;
  uploadedById: string;
}

export interface IVideo {
  id: string;
  fileUrl: string;
  fileName: string;
  title?: string;
}

export interface ICourses {
  _id: string;
  name: string;
  description: string;
  start: Date;
  modules: IModules[];
  videos: IVideo[];
  courseUsers?: ICourseUsers[];
  attendances: IAttendances[];
}

export interface IAttendances {
  id: string;
  _id: string;
  firstname: string;
  lastname: string;
  courseid: string;
  studentid: string;
  date: Date;
  isPresent: boolean;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  message: string;
  courseId: string | null;
  authorId: string;
  courseName: string;
}

export interface IModules {
  _id: string;
  name: string;
  description: string;
  start: string;
  end: string;
  activities: IActivity[];
}

export interface IUser {
  lastLogin: Date;
  _id: string;
  userName: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  courseIDs: string[];
}

export interface IRegisterUser {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  courseID: string[];
}

export interface IUserCourses {
  userName: string;
  courses: ICourses[];
}

export interface ICourseIds {
  id: string;
  name: string;
}

export interface ICourseUsers {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isPresent: boolean;
  courseId: string;
}

export interface IUserLoggedIn {
  _id: string;
  name: string;
  role: string;
  lastLogin: Date;
}

export interface IActivity {
  _id: string;
  name: string;
  description: string;
  moduleId: string; // the module this activity belongs to
  activityType?: "Assignment" | "Quiz" | "Lecture" | "Lab" | "Project";
  dueDate: Date;    // the main deadline
  documents: IDocument[];
  start?: Date;     // optional start date
  end?: Date;       // optional end date
  teacherID?: string; // optional: teacher who created the activity
  courseName: string;
}

export interface IJwtPayload extends JwtPayload {
  id: string;
  name: string;
  role: string;
  [key: string]: any;
}

export interface ITeacherStats {
  students: IUser[];
  submissions: ISubmission[];
}

export interface ISubmission {
  submitted: any;
  dueDate: string | Date | null;

  _id: string;
  studentName: string;
  activityId: string;
  studentId: string;
  fileName: string;
  fileUrl: string;
  activity: IActivity;
  submittedAt: Date;
  feedback?: {
    grade: number | null;
    feedbackText: string | null;
  };
  grade?: string | null;
  activityName: string;
}

export interface IUpcomingAssignment {
  _id: string;
  name: string;
  description: string;
  moduleId: string;
  activityType?: "Assignment" | "Quiz" | "Lecture" | "Lab" | "Project";
  documents: IDocument[];
  start?: Date;
  end?: Date;
  teacherID?: string;
  courseId: string;
  courseName: string;
  dueDate?: Date;
}

