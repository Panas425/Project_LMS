import { JwtPayload } from "jwt-decode";
import { CustomError } from "./classes";

export interface IAuthContext {
  tokens: ITokens | null;
  isLoggedIn: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<ITokens | CustomError | undefined>;
  logout: () => void;
  user: IUserLoggedIn | null;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  type: "Video" | "Other"; // match your DocumentType enum
  uploadedAt: string;
  moduleId: string;
  courseId: string;
  uploadedById: string;
}

export interface ITokenObjectExtensions extends JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
}

export interface IVideo {
  id: string;        // or Guid if you use string
  fileUrl: string;
  fileName: string;
  title?: string;
}

export interface ICourses {
  id: string;
  name: string;
  description: string;
  start: Date;
  modules: IModules[];
  videos: IVideo[];
  userCourse: ICourseUsers[];
  attendances: IAttendances[];
}

export interface IAttendances {
  id: string;
  firstname: string;
  lastname: string;
  courseid: string;
  studentid: string;
  date: Date;
  isPresent: boolean;
}

export interface IModules {
  id: string;
  name: string;
  description: string;
  start: string;
  end: string;
  activities: IActivity[];
}

export interface IUser {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  courseID: string[];
}
export interface IRegisterUser {
  FirstName: string;
  LastName: string;
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
  studentId: string;
  firstName: string;
  lastName: string;
  isPresent: boolean;
  courseId: string;
}



export interface IUserLoggedIn {
  id: string;
  name: string;
  role: string;
}

export interface IActivity {
  id: string;
  name: string;
  description: string;
  start: string;
  end: string;
  moduleID: string;
  activityType?: string;
}
export interface IJwtPayload {
  exp: number;
  iat: number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  [key: string]: any;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}
export interface ISubmission {
  id: string;
  studentName: string;
  fileName: string;
  fileUrl: string;
  activity: IActivity;
  feedback?: {
    grade: number | null;
    feedbackText: string | null;
  };


}

