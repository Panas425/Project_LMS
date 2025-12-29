// src/app/pages/__tests__/StudentDashboard.test.tsx
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import StudentDashboard from "../StudentDashboard";
import * as apiStore from "../../storesNode/apiDataStore";
import * as authStore from "../../storesNode/useAuthStoreNode";

// Mock the stores
jest.mock("../../storesNode/apiDataStore");
jest.mock("../../storesNode/useAuthStoreNode");

// Get properly typed mocked hooks
const mockedUseAuthStore = jest.mocked(authStore.useAuthStore);
const mockedUseApiDataStore = jest.mocked(apiStore.useApiDataStore);

describe("StudentDashboard", () => {
    beforeEach(() => {
        // Mock auth store
        mockedUseAuthStore.mockReturnValue({
            user: {
                _id: "student-1",
                firstName: "Jane",
                lastName: "Doe",
                email: "jane@example.com",
            },
            isLoggedIn: true,
            tokens: { accessToken: "token123" },
        });

        // Mock API store
        mockedUseApiDataStore.mockReturnValue({
            myCourses: [],
            fetchCoursesForUser: jest.fn(),
            fetchMySubmissionForActivity: jest.fn(),
        });
    });

    it("renders StudentDashboard without crashing", () => {
        render(<StudentDashboard />);
        expect(screen.getByText("Student Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Welcome back! Here’s an overview of your learning activity.")).toBeInTheDocument();
    });
});
