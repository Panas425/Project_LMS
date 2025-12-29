// src/app/components/__tests__/ActivityCard.test.tsx
import { render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";


import * as apiStore from "../../storesNode/apiDataStore";
import * as authStore from "../../storesNode/useAuthStoreNode";
import * as activityStoreModule from "../../stores/useActivityStore";
import { IActivity, ICourses, IModules, ISubmission } from "../../utilsNode";
import { ActivityCard } from "../../components/ActivityCard";

// Mock stores
jest.mock("../../storesNode/apiDataStore");
jest.mock("../../storesNode/useAuthStoreNode");
jest.mock("../../stores/useActivityStore");

const mockedUseApiDataStore = jest.mocked(apiStore.useApiDataStore);
const mockedUseAuthStore = jest.mocked(authStore.useAuthStore);
const mockedUseActivityStore = jest.mocked(activityStoreModule.useActivityStore);

describe("ActivityCard", () => {
    const fakeActivity: IActivity = {
        _id: "activity1",
        name: "Activity 1",
        description: "Test Activity",
        moduleId: "module1",
        courseName: "Course 1",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
        documents: [],
        start: new Date(),
        end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        activityType: "Assignment",
        teacherID: "teacher1",
    };
    const fakeModule: IModules = {
        _id: "module1",
        name: "Module 1",
        description: "Module Description",
        start: new Date().toISOString(),
        end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
        activities: [fakeActivity],
    };
    const fakeCourse: ICourses = {
        _id: "course1",
        name: "Course 1",
        description: "Course Description",
        start: new Date(),
        modules: [fakeModule],
        videos: [],
        attendances: [],
    };



    beforeEach(() => {
        mockedUseAuthStore.mockReturnValue({
            user: { _id: "student1", name: "Jane Doe", role: "student" },
            isLoggedIn: true,
            tokens: { accessToken: "token123" },
        });

        mockedUseApiDataStore.mockReturnValue({
            uploadSubmission: jest.fn(),
            fetchSubmissionsByActivity: jest.fn().mockResolvedValue([]),
            deleteSubmission: jest.fn(),
            deleteActivity: jest.fn(),
            fetchMySubmissionForActivity: jest.fn().mockResolvedValue([]),
        });

        // Mock Activity store
        const submissions: ISubmission[] = [];
        const setSubmissions = jest.fn();
        mockedUseActivityStore.mockReturnValue({
            submissions,
            setSubmissions,
        } as any);
    });

    it("renders activity name and description", () => {
        render(
            <ActivityCard
                course={fakeCourse}
                module={fakeModule}
                activity={fakeActivity}
                onActivityDeleted={jest.fn()}
                onActivityAdded={jest.fn()}
            />
        );

        expect(screen.getByText("Activity 1")).toBeInTheDocument();
        expect(screen.getByText("Test Activity")).toBeInTheDocument();
        expect(screen.getByText("No documents uploaded for this activity")).toBeInTheDocument();
    });

    it("shows upload button for students", () => {
        render(
            <ActivityCard
                course={fakeCourse}
                module={fakeModule}
                activity={fakeActivity}
                onActivityDeleted={jest.fn()}
                onActivityAdded={jest.fn()}
            />
        );

        expect(screen.getByText("Upload Submission")).toBeInTheDocument();
    });
});
