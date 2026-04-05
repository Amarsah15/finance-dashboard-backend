import { z } from "zod";

// 1. Zod schema for creating/updating a record
export const recordValidationSchema = z.object({
  body: z.object({
    amount: z
      .number({ required_error: "Amount is required" })
      .positive("Amount must be a positive number"),
    type: z.enum(["income", "expense"], {
      required_error: "Type must be 'income' or 'expense'",
    }),
    category: z
      .string({ required_error: "Category is required" })
      .min(2, "Category is too short"),
    date: z.string().datetime().optional(),
    notes: z.string().max(500).optional(),
  }),
});

// 2. Auth Schemas
export const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }).min(2),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

// 3. Reusable validation middleware
export const validate = (schema) => (req, res, next) => {
  try {
    // Safety check in case a schema isn't passed correctly
    if (!schema) throw new Error("Schema is undefined");

    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    // Check if it is a specific Zod validation error
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        // .issues is the modern Zod property for errors
        errors: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    // If it's a generic error (like the schema missing), pass it to your global error handler
    next(error);
  }
};
