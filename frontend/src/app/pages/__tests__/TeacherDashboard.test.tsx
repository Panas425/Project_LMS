import React from "react"; // required for Jest
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TeacherDashboard from "../TeacherDashboard";
import * as apiStore from "../../storesNode/apiDataStore";
import * as authStore from "../../storesNode/useAuthStoreNode";

// Mock the stores
jest.mock("../../storesNode/apiDataStore");
jest.mock("../../storesNode/useAuthStoreNode");

describe("TeacherDashboard", () => {
    beforeEach(() => {
        // Mock the auth store
        (jest.mocked(authStore.useAuthStore) as unknown as jest.Mock).mockReturnValue({
            user: { _id: "123", firstName: "John", lastName: "Doe", email: "john@example.com" },
            isLoggedIn: true,
            tokens: { accessToken: "abc" },
        });

        // Mock the API data store
        (jest.mocked(apiStore.useApiDataStore) as unknown as jest.Mock).mockReturnValue({
            myCourses: [],
            fetchCoursesForUser: jest.fn(),
            fetchMySubmissionForActivity: jest.fn(),
            fetchRecentAnnouncements: jest.fn(),
            fetchTeacherStats: jest.fn(),
            teacherStats: { students: [], submissions: [] },
            teacherStatsLoading: false,
        });
    });

    it("renders TeacherDashboard without crashing", () => {
        render(<TeacherDashboard />);
        expect(screen.getByText("Teacher Dashboard")).toBeInTheDocument();
    });
});
