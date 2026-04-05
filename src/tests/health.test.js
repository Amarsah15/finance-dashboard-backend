import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Health Check API", () => {
  it("should return 200 and a success message", async () => {
    // Supertest simulates a GET request to Express 
    const response = await request(app).get("/api/health");

    // Assertions (What we expect the result to be)
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Server is healthy");
  });

  it("should return 404 for an unknown route", async () => {
    const response = await request(app).get("/api/this-route-does-not-exist");

    // It should hit notFound middleware
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Not Found");
  });
});
