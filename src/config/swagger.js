import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Dashboard API",
      version: "1.0.0",
      description:
        "A RESTful backend API for a multi-role finance dashboard system. Supports financial record management, role-based access control, and aggregated analytics.",
    },
    servers: [
      {
        url: "https://finance-dashboard-aj19.onrender.com",
        description: "Production server (Render)",
      },
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your JWT token. Get it from POST /api/v1/auth/login",
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Jane Doe" },
            email: {
              type: "string",
              format: "email",
              example: "jane@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "password123",
            },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "admin@test.com",
            },
            password: { type: "string", example: "password123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
                name: { type: "string", example: "Jane Doe" },
                email: { type: "string", example: "jane@example.com" },
                role: {
                  type: "string",
                  enum: ["Viewer", "Analyst", "Admin"],
                  example: "Viewer",
                },
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
        },

        // ── Record ────────────────────────────────────────────
        RecordInput: {
          type: "object",
          required: ["amount", "type", "category"],
          properties: {
            amount: { type: "number", example: 5000 },
            type: {
              type: "string",
              enum: ["income", "expense"],
              example: "income",
            },
            category: { type: "string", example: "Salary" },
            date: {
              type: "string",
              format: "date-time",
              example: "2025-06-01T00:00:00.000Z",
            },
            notes: { type: "string", example: "Monthly salary deposit" },
          },
        },
        Record: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            user: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string", example: "Admin User" },
                email: { type: "string", example: "admin@test.com" },
              },
            },
            amount: { type: "number", example: 5000 },
            type: {
              type: "string",
              enum: ["income", "expense"],
              example: "income",
            },
            category: { type: "string", example: "Salary" },
            date: { type: "string", format: "date-time" },
            notes: { type: "string", example: "Monthly salary deposit" },
            isDeleted: { type: "boolean", example: false },
            deletedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        PaginatedRecords: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            count: { type: "integer", example: 10 },
            pagination: {
              type: "object",
              properties: {
                totalRecords: { type: "integer", example: 47 },
                currentPage: { type: "integer", example: 1 },
                totalPages: { type: "integer", example: 3 },
                limit: { type: "integer", example: 20 },
              },
            },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Record" },
            },
          },
        },

        // ── Dashboard ─────────────────────────────────────────
        DashboardSummary: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                summary: {
                  type: "object",
                  properties: {
                    totalIncome: { type: "number", example: 15000 },
                    totalExpense: { type: "number", example: 8200 },
                    netBalance: { type: "number", example: 6800 },
                  },
                },
                categories: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string", example: "Salary" },
                      type: { type: "string", example: "income" },
                      totalAmount: { type: "number", example: 10000 },
                    },
                  },
                },
                trends: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      year: { type: "integer", example: 2025 },
                      month: { type: "integer", example: 6 },
                      income: { type: "number", example: 5000 },
                      expense: { type: "number", example: 2700 },
                      net: { type: "number", example: 2300 },
                    },
                  },
                },
                recentActivity: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Record" },
                },
              },
            },
          },
        },

        // ── User ──────────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            name: { type: "string", example: "Admin User" },
            email: { type: "string", example: "admin@test.com" },
            role: {
              type: "string",
              enum: ["Viewer", "Analyst", "Admin"],
              example: "Admin",
            },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // ── Errors ────────────────────────────────────────────
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: {
              type: "string",
              example: "A human-readable error description",
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],

    // ── Paths ─────────────────────────────────────────────────
    paths: {
      // AUTH
      "/api/v1/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          description:
            "Creates a new user account. Role is always set to **Viewer** regardless of what is passed in the body.",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterInput" },
              },
            },
          },
          responses: {
            201: {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            400: {
              description: "User already exists or validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/v1/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login and receive a JWT token",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginInput" },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            401: {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            403: {
              description: "Account is deactivated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },

      // RECORDS
      "/api/v1/records": {
        get: {
          tags: ["Records"],
          summary: "Get all records",
          description:
            "Returns paginated financial records. Supports filtering by type, category, date range, and full-text search across category and notes. **Admin and Analyst only.**",
          parameters: [
            {
              name: "type",
              in: "query",
              schema: { type: "string", enum: ["income", "expense"] },
              description: "Filter by record type",
            },
            {
              name: "category",
              in: "query",
              schema: { type: "string" },
              description: "Filter by exact category name",
            },
            {
              name: "search",
              in: "query",
              schema: { type: "string" },
              description:
                "Search across category and notes (case-insensitive)",
            },
            {
              name: "startDate",
              in: "query",
              schema: { type: "string", format: "date" },
              description: "Filter records from this date (ISO format)",
            },
            {
              name: "endDate",
              in: "query",
              schema: { type: "string", format: "date" },
              description: "Filter records up to this date (ISO format)",
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20 },
              description: "Records per page",
            },
            {
              name: "includeDeleted",
              in: "query",
              schema: { type: "string", enum: ["true"] },
              description: "Admin only — include soft-deleted records",
            },
          ],
          responses: {
            200: {
              description: "Records fetched successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PaginatedRecords" },
                },
              },
            },
            401: {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            403: {
              description: "Insufficient permissions",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        post: {
          tags: ["Records"],
          summary: "Create a new financial record",
          description:
            "**Admin only.** Creates a new record associated with the authenticated Admin's user ID.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RecordInput" },
              },
            },
          },
          responses: {
            201: {
              description: "Record created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { $ref: "#/components/schemas/Record" },
                    },
                  },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            403: {
              description: "Insufficient permissions",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/v1/records/{id}": {
        put: {
          tags: ["Records"],
          summary: "Update a record",
          description:
            "**Admin only.** Updates allowed fields only (amount, type, category, date, notes). The `user` field cannot be changed.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the record",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RecordInput" },
              },
            },
          },
          responses: {
            200: {
              description: "Record updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { $ref: "#/components/schemas/Record" },
                    },
                  },
                },
              },
            },
            404: {
              description: "Record not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Records"],
          summary: "Soft-delete a record",
          description:
            "**Admin only.** Marks the record as deleted (`isDeleted: true`). The record is not removed from the database. Admins can still view it via `?includeDeleted=true`.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the record",
            },
          ],
          responses: {
            200: {
              description: "Record soft-deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
            404: {
              description: "Record not found or already deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },

      // DASHBOARD
      "/api/v1/dashboard/summary": {
        get: {
          tags: ["Dashboard"],
          summary: "Get aggregated financial summary",
          description:
            "Returns total income, expenses, net balance, category totals, monthly trends (last 6 months), and recent activity.\n\n**Admins** see data aggregated across all users.\n\n**Analysts and Viewers** see only their own data.",
          responses: {
            200: {
              description: "Dashboard summary fetched successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DashboardSummary" },
                },
              },
            },
            401: {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },

      // USERS
      "/api/v1/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get own profile",
          description:
            "Returns the profile of the currently authenticated user. Available to all roles.",
          responses: {
            200: {
              description: "Profile fetched",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/users": {
        get: {
          tags: ["Users"],
          summary: "Get all users",
          description:
            "**Admin only.** Returns a list of all registered users (passwords excluded).",
          responses: {
            200: {
              description: "Users fetched",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      count: { type: "integer" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/User" },
                      },
                    },
                  },
                },
              },
            },
            403: {
              description: "Insufficient permissions",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/v1/users/{id}/role": {
        put: {
          tags: ["Users"],
          summary: "Update a user's role",
          description: "**Admin only.** Promotes or demotes a user's role.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the user",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["role"],
                  properties: {
                    role: {
                      type: "string",
                      enum: ["Viewer", "Analyst", "Admin"],
                      example: "Analyst",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Role updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            400: {
              description: "Invalid role value",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "User not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/v1/users/{id}/status": {
        put: {
          tags: ["Users"],
          summary: "Activate or deactivate a user",
          description:
            "**Admin only.** Sets the `isActive` status of a user. Deactivated users cannot log in and are blocked at the middleware level on existing sessions.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "MongoDB ObjectId of the user",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["isActive"],
                  properties: { isActive: { type: "boolean", example: false } },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Status updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            400: {
              description: "isActive must be a boolean",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            404: {
              description: "User not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },

      // HEALTH
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          description: "Returns server status. No authentication required.",
          security: [],
          responses: {
            200: {
              description: "Server is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      message: { type: "string", example: "Server is healthy" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
