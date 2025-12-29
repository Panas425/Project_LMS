const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Course = require("../models/Course");
const User = require("../models/User");

jest.setTimeout(30000); // allow slow DB

beforeAll(async () => {
    let connected = false;
    while (!connected) {
        try {
            await mongoose.connect("mongodb://127.0.0.1:27017/lms_test_db", {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
            });
            connected = true;
        } catch (err) {
            console.log("Waiting for MongoDB to be ready...");
            await new Promise((r) => setTimeout(r, 1000));
        }
    }
});

afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState === 1) { // 1 = connected
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
});

describe("Course Controller - Integration Tests", () => {
    let course;
    let user;

    beforeEach(async () => {
        course = await Course.create({
            name: "Test Course",
            description: "A sample course",
            startDate: new Date("2025-01-01"),
            end: new Date("2025-12-31"),
            modules: [],
            moduleIds: [],
            userIds: [],
            courseUsers: []
        });

        user = await User.create({
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "123456",
            role: "student",
            courseIDs: []
        });
    });

    test("POST /api/courses -> creates a new course", async () => {
        const res = await request(app)
            .post("/api/courses")
            .send({
                name: "New Course",
                description: "Another course",
                start: "2025-02-01"
            });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe("New Course");
    });

    test("GET /api/courses -> returns all courses", async () => {
        const res = await request(app).get("/api/courses");
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe("Test Course");
    });

    test("PUT /api/courses/:id/modules -> adds a module", async () => {
        const res = await request(app)
            .put(`/api/courses/${course._id}/modules`)
            .send({
                name: "Module 1",
                description: "Module description",
                start: "2025-02-01"
            });

        expect(res.status).toBe(200);
        expect(res.body.module.name).toBe("Module 1");
    });

    test("PUT /api/courses/:id/users -> adds a user to a course", async () => {
        const res = await request(app)
            .put(`/api/courses/${course._id}/users`)
            .send({ userId: user._id });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("User added to course successfully");
    });

    test("GET /api/courses/:userId/courses -> gets user's courses", async () => {
        await request(app)
            .put(`/api/courses/${course._id}/users`)
            .send({ userId: user._id });

        const res = await request(app).get(`/api/courses/${user._id}/courses`);
        expect(res.status).toBe(200);
        expect(res.body.courses.length).toBe(1);
        expect(res.body.courses[0].name).toBe("Test Course");
    });

    test("GET /api/courses/getCourseById/:courseId -> retrieves single course", async () => {
        const res = await request(app).get(`/api/courses/getCourseById/${course._id}`);
        expect(res.status).toBe(200);
        expect(res.body.name).toBe("Test Course");
    });
});
