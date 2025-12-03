const { z } = require("zod");

exports.bookDemoSchema = z.object({
    fullName: z.string().trim().min(2, "Full name is required"),
    businessName: z.string().trim().min(2, "Business name is required"),
    email: z.string().trim().email("Invalid email address"),
    phoneNumber: z
        .string()
        .trim()
        .regex(/^\d{7,15}$/, "Invalid phone number"),
    teamSize: z.string().trim().min(1, "Team size is required"),
    primaryObjective: z.string().trim().min(1, "Primary objective is required"),
    message: z.string().trim().min(5, "Message is required"),
});
