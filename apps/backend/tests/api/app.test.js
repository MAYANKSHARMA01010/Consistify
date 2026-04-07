const request = require("supertest");
const app = require("../../src/server");

describe("API smoke tests", () => {
    test("GET / returns backend running response", async () => {
        const res = await request(app).get("/");

        expect(res.status).toBe(200);
        expect(res.text).toContain("Backend Running Successfully");
    });

    test("GET /api/summary/today returns 401 without auth cookie", async () => {
        const res = await request(app).get("/api/summary/today");

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Unauthorized");
    });

    test("POST /api/auth/login validates required fields", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "", password: "" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Email and password are required");
    });
});
