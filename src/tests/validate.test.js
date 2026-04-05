import { describe, it, expect, vi } from "vitest";
import {
  validate,
  loginValidationSchema,
} from "../middlewares/validate.middleware.js";

describe("Zod Validation Middleware", () => {
  it("should call next() if validation passes", () => {
    // Mock the Express req, res, and next objects
    const req = {
      body: { email: "admin@test.com", password: "password123" },
      query: {},
      params: {},
    };
    const res = {};
    const next = vi.fn(); // Create a spy function

    // Create the specific middleware function for login
    const middleware = validate(loginValidationSchema);

    // Run the middleware
    middleware(req, res, next);

    // Expect next() to have been called exactly once
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return 400 if validation fails (missing password)", () => {
    const req = {
      body: { email: "admin@test.com" }, // Missing password!
      query: {},
      params: {},
    };

    // Mock the res.status().json() chain
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    const middleware = validate(loginValidationSchema);
    middleware(req, res, next);

    // Expect it to catch the error and return status 400
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Validation Error",
      }),
    );
  });
});
